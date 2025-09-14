import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button, Spinner, Skeleton, Tooltip } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const sh = [
  "Good job!",
  "Keep it up!",
  "Kudos!",
  ":)",
  "Awesome!",
  "Well done!",
  "Excellent!",
  "Nice work!",
  "Great!",
  "Super!",
  "Way to go!",
  "You rock!",
  "Fantastic!",
  "Terrific!",
  "Amazing!",
  "Perfect!",
  "Outstanding!",
  "Brilliant!",
  "Superb!",
  "Spectacular!",
  "A+",
  "You're the best!",
  "Nailed it!",
  "Bravo!",
  "Cheers!",
  "Sweet!",
  "Cool!",
  "Right on!",
  "That's the way!",
  "Yippee!",
];

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUserLoading(true);
        getDoc(doc(db, "users", currentUser.uid)).then((docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data());
          }
          setUserLoading(false);
        });
        // Fetch plans for current user
        const fetchPlans = async () => {
          setPlansLoading(true);
          const plansQuery = query(
            collection(db, "plans"),
            where("createdBy", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(plansQuery);
          const plansArr = [];
          querySnapshot.forEach((doc) => {
            plansArr.push({ id: doc.id, ...doc.data() });
          });
          setPlans(plansArr);
          setPlansLoading(false);
        };
        fetchPlans();

        // Fetch sessions for current user
        const fetchSessions = async () => {
          setSessionsLoading(true);
          const sessionsQuery = query(
            collection(db, "sessions"),
            where("createdBy", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(sessionsQuery);
          const sessionsArr = [];
          querySnapshot.forEach((doc) => {
            sessionsArr.push({ id: doc.id, ...doc.data() });
          });
          setSessions(sessionsArr);
          setSessionsLoading(false);
        };
        fetchSessions();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (userLoading) {
    return (
      <div className="p-2 w-full">
        <div className="w-full mb-6">
          <Skeleton className="!h-10 w-1/3 rounded" />
        </div>
        <div>
          <div className="text-gray-400 font-bold">Your Progress</div>
          <div className="border-gray-200 border-2 rounded-md p-2 flex flex-col gap-1">
            <Skeleton className="w-full !h-[100px] " ></Skeleton>
          </div>
        </div>
        <div>
          <div className="mt-4 text-2xl font-[Cal_Sans]">
            <Skeleton className="h-8 w-32 rounded" />
          </div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="!h-[20vh] !p-4 !rounded-md"
                style={{ width: "100%" }}
              />
            ))}
          </div>
        </div>
        {/* Sessions Section Skeleton */}
        <div>
          <div className="mt-4 text-2xl font-[Cal_Sans]">
            <Skeleton className="h-8 w-32 rounded" />
          </div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="!h-[20vh] !p-4 !rounded-md"
                style={{ width: "100%" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 ">
      {user && (
        <>
          <div className="w-full mb-6">
            <h1 className="font-[Cal_Sans] text-3xl">
              Welcome back, {user.firstName}!
            </h1>
            <h1 className="font-[Cal_Sans] text-xl">The machine assists but the effort is all yours</h1>
          </div>
          <div>
            <div className="text-gray-400 font-bold">Your Progress</div>
            <div className="border-gray-200 border-2 rounded-md p-2 flex flex-col gap-1">
              <div className="w-full flex gap-1 flex-wrap h-fit">
                {(() => {
                  const arr = user.contributions || [];
                  const nonZero = arr.filter((w) => w > 0);
                  const avg =
                    nonZero.length > 0
                      ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
                      : 0;
                  // Calculate the date for each contribution index
                  const today = new Date();
                  return arr.map((weight, i) => {
                    let color = "bg-gray-200";
                    if (weight === 0) color = "bg-gray-200";
                    else if (weight < avg * 0.5) color = "bg-ruby-5";
                    else if (weight < avg) color = "bg-ruby-7";
                    else if (weight < avg * 1.5) color = "bg-ruby-10";
                    else color = "bg-ruby-9";
                    // Calculate date string for this index (i)
                    // contributions[0] is Jan 1st, contributions[364] is Dec 31st
                    const year = new Date().getFullYear();
                    const date = new Date(year, 0, i + 1); // Jan 1 + i days
                    const dateStr = date.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                    if (weight == 0) {
                      return (
                        <div
                          key={i}
                          className={`size-4 rounded-sm ${color}`}
                        ></div>
                      );
                    } else {
                      return (
                        <Tooltip content={`${weight} points, ${dateStr}`}>
                          <div
                            key={i}
                            className={`size-4 rounded-sm ${color}`}
                          ></div>
                        </Tooltip>
                      );
                    }
                  });
                })()}
              </div>
            </div>
          </div>
          <div>
            <div className="mt-4 text-2xl font-[Cal_Sans]">Plans</div>
            <div className="grid grid-cols-5 gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/create")}
                color="ruby"
                className="!h-[20vh] !p-4 !text-xl !font-[Cal_Sans]"
              >
                <PlusCircledIcon width={20} height={20} />
                Create plan
              </Button>
              {plansLoading ? (
                // Show 4 skeletons as placeholders
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="!h-[20vh] !p-4 !rounded-md"
                      style={{ width: "100%" }}
                    />
                  ))}
                </>
              ) : (
                plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
              )}
            </div>
          </div>
          {/* Sessions Section */}
          <div>
            <div className="mt-4 text-2xl font-[Cal_Sans]">Sessions</div>
            <div className="grid grid-cols-5 gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/start")}
                color="ruby"
                className="!h-[20vh] !p-4 !text-xl !font-[Cal_Sans]"
              >
                <PlusCircledIcon width={20} height={20} />
                Create Session
              </Button>
              {sessionsLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="!h-[20vh] !p-4 !rounded-md"
                      style={{ width: "100%" }}
                    />
                  ))}
                </>
              ) : (
                sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PlanCard = ({ plan }) => {
  // Calculate percentage done
  const checklist = Array.isArray(plan.checklistDone) ? plan.checklistDone : [];
  const total = checklist.length;
  const done = checklist.filter(Boolean).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  // Set color and progress bar classes based on completion
  const isDone = percent === 100;
  const buttonColor = isDone ? "green" : "ruby";
  const progressBg = isDone ? "bg-green-3" : "bg-ruby-3";
  const progressBar = isDone ? "bg-green-9" : "bg-ruby-9";

  // Pick a random word from sh if done
  const randomSh = isDone ? sh[Math.floor(Math.random() * sh.length)] : null;
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate(`/plan/${plan.id}`)}
      variant="outline"
      color={buttonColor}
      className="!h-[20vh] !p-4 !flex !flex-col !items-start !gap-0 !justify-start "
    >
      <div className="text-xl font-[Cal_Sans]">{plan.name}</div>
      <div className="text-base">{plan.type}</div>
      <div
        className={`w-full h-[5vh] mt-auto rounded-sm relative flex items-center justify-start ${progressBg}`}
      >
        {isDone && (
          <div className="z-40 text-white font-[Cal_Sans] absolute mx-2">
            {randomSh}
          </div>
        )}
        <div
          className={`h-full rounded-sm ${progressBar}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="w-full text-right font-[Cal_Sans]">{percent}%</div>
    </Button>
  );
};

// SessionCard copied/adapted from Sessions.jsx
const SessionCard = ({ session }) => {
  const total = Array.isArray(session.data) ? session.data.length : 0;
  const locked = Array.isArray(session.lockedSteps)
    ? session.lockedSteps.length
    : 0;
  const percent = total > 0 ? Math.round(((total - locked) / total) * 100) : 0;

  const isDone = percent === 100;
  const buttonColor = isDone ? "green" : "ruby";
  const progressBg =
    session.locked === true ? "bg-blue-3" : isDone ? "bg-green-3" : "bg-ruby-3";
  const progressBar =
    session.locked === true ? "bg-blue-9" : isDone ? "bg-green-9" : "bg-ruby-9";

  const [showLockedDialog, setShowLockedDialog] = React.useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (session.locked === true) {
      setShowLockedDialog(true);
    } else {
      navigate(`/session/${session.id}`);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        color={session.locked === true ? "blue" : buttonColor}
        className={`!h-[20vh] !p-4 !flex !flex-col !items-start !gap-0 !justify-start ${
          session.locked === true ? "!border-blue-7 !bg-blue-2" : ""
        }`}
        asChild
        tabIndex={-1}
        style={{ pointerEvents: "none" }}
      >
        <div>
          <div className="text-xl font-[Cal_Sans]">{session.name}</div>
          <div className="text-base">{session.type}</div>
          <div
            className={`w-full h-[5vh] mt-auto rounded-sm relative flex items-center justify-start ${progressBg}`}
          >
            <div
              className={`h-full rounded-sm ${progressBar}`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="w-full text-right font-[Cal_Sans]">{percent}%</div>
          {/* Show creation date below progress bar, no label */}
          <div className="w-full text-xs font-[Cal_Sans] text-gray-500 mt-1 text-right">
            {session.createdAt
              ? (() => {
                  // Firestore Timestamp or ISO string
                  let dateObj;
                  if (session.createdAt.seconds) {
                    dateObj = new Date(session.createdAt.seconds * 1000);
                  } else {
                    dateObj = new Date(session.createdAt);
                  }
                  return dateObj.toLocaleDateString();
                })()
              : ""}
          </div>
        </div>
      </Button>
      {showLockedDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4 min-w-[300px]">
            <div className="text-lg font-bold text-blue-700">
              Session is already over
            </div>
            <div className="text-gray-600">
              You cannot access this session anymore.
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                color="blue"
                variant="soft"
                onClick={() => setShowLockedDialog(false)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
