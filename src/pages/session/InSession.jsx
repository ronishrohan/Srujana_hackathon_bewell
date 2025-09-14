import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../firebase";
import { Spinner, Button } from "@radix-ui/themes";

// --- TTS utility ---
function speak(text) {
    console.log("test") 
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}

const InSession = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [lockedSteps, setLockedSteps] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingStepIdx, setPendingStepIdx] = useState(null);
  const intervalRef = useRef(null);
  const [voiceAssisted, setVoiceAssisted] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "sessions", sessionId)).then((sessionDoc) => {
      const data = sessionDoc.data();
      setSession(data);
      setVoiceAssisted(!!data.voiceAssisted);
      const locked = data.lockedSteps || [];
      setLockedSteps(locked);
      // Find the first unlocked step
      let firstUnlocked = 0;
      if (data.data && Array.isArray(data.data)) {
        for (let i = 0; i < data.data.length; i++) {
          if (!locked.includes(i)) {
            firstUnlocked = i;
            break;
          }
        }
      }
      setStepIdx(firstUnlocked);
      setLoading(false);
    });
  }, [sessionId]);

  // Speak step title and instructions on step change if voiceAssisted
  useEffect(() => {
    if (!session || !session.data || !session.data[stepIdx]) return;
    if (!voiceAssisted) return;
    const step = session.data[stepIdx];
    let text = step.title || "";
    if (step.instructions && Array.isArray(step.instructions)) {
      text += ". " + step.instructions.join(". ");
    } else if (step.description) {
      text += ". " + step.description;
    }
    speak(text);
  }, [stepIdx, session, voiceAssisted]);

  // Start timer when session and stepIdx change
  useEffect(() => {
    if (!session || !session.data || !session.data[stepIdx]) return;
    setTimer(Number(session.data[stepIdx].time) * 60); // convert min to sec
    setRunning(true);
  }, [session, stepIdx]);

  // Timer countdown logic
  useEffect(() => {
    if (!running) return;
    if (timer <= 0) {
      setRunning(false);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, timer]);

  // Move to next step when timer hits 0
  useEffect(() => {
    if (timer === 0 && running) {
      setRunning(false);
      if (session && session.data && stepIdx < session.data.length - 1) {
        setTimeout(() => setStepIdx((idx) => idx + 1), 1000);
      }
    }
  }, [timer, running, session, stepIdx]);

  // Handle skip or step navigation with dialog
  const handleStepChange = (targetIdx) => {
    if (lockedSteps.includes(stepIdx) || targetIdx === stepIdx) return;
    setPendingStepIdx(targetIdx);
    setShowDialog(true);
  };

  // Confirm skip or navigation
  const confirmSkipOrNavigate = async () => {
    setShowDialog(false);
    const newLocked = [...lockedSteps, stepIdx];
    setLockedSteps(newLocked);
    // Update Firestore: lock this step, set done: false
    if (pendingStepIdx !== null) {
      setStepIdx(pendingStepIdx);
      setPendingStepIdx(null);
    }
    await updateDoc(doc(db, "sessions", sessionId), {
      lockedSteps: newLocked,
      [`doneStep_${stepIdx}`]: false,
    });
    
  };

  // Cancel skip/navigation
  const cancelDialog = () => {
    setShowDialog(false);
    setPendingStepIdx(null);
  };

  // Handle skip button
  const handleSkip = () => {
    if (lockedSteps.includes(stepIdx)) return;
    setPendingStepIdx(stepIdx + 1);
    setShowDialog(true);
  };

  const navigate = useNavigate()

  // Mark user contribution if all steps done and none skipped
  useEffect(() => {
    if (
      session &&
      stepIdx >= session.data.length &&
      (!lockedSteps || lockedSteps.length === 0)
    ) {
      const updateContribution = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        let contributions = [];
        if (userSnap.exists()) {
          contributions = userSnap.data().contributions || [];
        }
        if (!Array.isArray(contributions) || contributions.length !== 365) {
          contributions = Array(365).fill(0);
        }
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const dayIndex = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 365) {
          contributions[dayIndex] = (contributions[dayIndex] || 0) + 1;
        }
        const score = contributions.reduce((a, b) => a + b, 0);
        await updateDoc(userRef, { contributions, score });
      };
      updateContribution();
    }
  }, [session, stepIdx, lockedSteps]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session || !session.data || session.data.length === 0) {
    return <div className="p-4">No session data found.</div>;
  }

  if (stepIdx >= session.data.length) {
    return (
      <div className="size-full flex flex-col items-center justify-center gap-4">
        <div className="text-3xl font-[Cal_Sans]">Session Complete!</div>
        <Button onClick={() => navigate("/sessions")}>Back to sessions</Button>
      </div>
    );
  }

  const step = session.data[stepIdx];
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const isLastStep = stepIdx === session.data.length - 1;

  const handleFinish = async () => {
    // If the last step is not completed (i.e., skipped), add it to lockedSteps
    if (!lockedSteps.includes(stepIdx)) {
      const newLocked = [...lockedSteps, stepIdx];
      setLockedSteps(newLocked);
      await updateDoc(doc(db, "sessions", sessionId), {
        lockedSteps: newLocked,
        [`doneStep_${stepIdx}`]: false,
        locked: true,
      });
    } else {
      // Mark session as locked in Firestore
      await updateDoc(doc(db, "sessions", sessionId), {
        locked: true,
      });
    }
    setStepIdx(session.data.length); // triggers session complete UI
  };

  return (
    <div className="size-full p-2 flex flex-col items-center">
      {/* Title and subtitle */}
      <div className="sticky top-0 bg-white/40 backdrop-blur-md z-50 w-full mb-4">
        <div className="flex flex-col gap-1 items-start">
          <div className="text-3xl font-[Cal_Sans]">{session.name || "Session"}</div>
          <div className="text-xl font-[Cal_Sans] text-gray-500">
            {session.type || "Fitness"}
          </div>
        </div>
        {/* Stepper */}
        <div className="flex gap-2 justify-start mt-2 mb-2 flex-wrap">
          {session.data.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleStepChange(idx)}
              disabled={lockedSteps.includes(idx)}
              className={`rounded-full flex items-center gap-2 px-3 py-1 font-bold border transition-all
                ${stepIdx === idx
                  ? "bg-ruby-9 text-white border-ruby-9 scale-105"
                  : lockedSteps.includes(idx)
                  ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-white border-ruby-3 text-ruby-9 hover:bg-ruby-3"
                }`}
              style={{ outline: "none" }}
              aria-label={`Go to step ${idx + 1}`}
            >
              <span className="rounded-full w-6 h-6 flex items-center justify-center border border-inherit bg-inherit">
                {idx + 1}
              </span>
              <span className="text-base font-normal">{s.title}</span>
              {/* {lockedSteps.includes(idx) && (
                <span className="ml-1 text-xs text-gray-400">(Locked)</span>
              )} */}
            </button>
          ))}

        </div>
      </div>
      {/* Step content */}
      <div className="flex flex-col items-center justify-center gap-6 w-full flex-1">
        <div className="text-2xl font-[Cal_Sans]">{step.title}</div>
        <div className="text-lg text-gray-500 mb-2">{step.description}</div>
        <div className="text-7xl font-[Jetbrains_Mono] mb-4">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
        <div className="flex flex-col gap-2 w-[40vw]">
          {step.instructions && step.instructions.map((inst, i) => (
            <div key={i} className="text-base">• {inst}</div>
          ))}
        </div>
        {/* Only show Skip Step if not last step */}
        {!isLastStep && (
          <Button
            color="ruby"
            variant="soft"
            onClick={handleSkip}
            disabled={lockedSteps.includes(stepIdx)}
          >
            Skip Step
          </Button>
        )}
        {/* If last step, show Submit button */}
        {isLastStep && (
          <Button
            color="green"
            variant="solid"
            onClick={handleFinish}
            className="w-40"
          >
            Submit
          </Button>
        )}
      </div>
      {/* Warning Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4 min-w-[300px]">
            <div className="text-lg font-bold">Are you sure?</div>
            <div className="text-gray-600">You are about to skip or leave this step. This step will be locked and marked as incomplete.</div>
            <div className="flex gap-2 justify-end">
              <Button color="gray" variant="soft" onClick={cancelDialog}>Cancel</Button>
              <Button color="ruby" variant="solid" onClick={confirmSkipOrNavigate}>Yes, skip</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InSession;
