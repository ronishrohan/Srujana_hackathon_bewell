import React, { useEffect, useState } from "react";
import { Checkbox, Spinner } from "@radix-ui/themes";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import { CheckCircledIcon } from "@radix-ui/react-icons";

const ChecklistCheckbox = ({
  checked,
  onCheckedChange,
  label,
  date,
  userId,
}) => {
  // Handles updating user contributions on check
  const handleChange = async () => {
    await onCheckedChange();
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    let contributions = [];
    if (userSnap.exists()) {
      contributions = userSnap.data().contributions || [];
    }
    // Ensure array is 365 in length
    if (!Array.isArray(contributions) || contributions.length !== 365) {
      contributions = Array(365).fill(0);
    }
    // Calculate day index (0-364) from date
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayIndex = Math.floor(
      (date - startOfYear) / (1000 * 60 * 60 * 24)
    );
    console.log(dayIndex)
    if (dayIndex >= 0 && dayIndex < 365) {
      contributions[dayIndex] = (contributions[dayIndex] || 0) + 1;
    }
    console.log(contributions[dayIndex])
    // Calculate total score
    const score = contributions.reduce((a, b) => a + b, 0);
    await updateDoc(userRef, { contributions, score });
  };

  return (
    <label className="flex items-center gap-2 hover:bg-ruby-3 p-2 rounded-md !w-full select-none cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={handleChange} />
      <span className={checked ? "line-through" : ""}>{label}</span>
    </label>
  );
};

const Plan = () => {
  const [data, setData] = useState({
    checklist: [],
    checklistDone: [],
    name: "",
    type: "",
    difficulty: "",
    prompt: "",
    numChecks: 0,
    createdBy: "",
    createdAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState([]);
  const { planId } = useParams();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const planDoc = await getDoc(doc(db, "plans", planId));
      const planData = planDoc.data();
      setData(planData);
      setChecked(
        planData && Array.isArray(planData.checklistDone)
          ? planData.checklistDone
          : Array.isArray(planData.checklist)
          ? planData.checklist.map(() => false)
          : []
      );
      setUserId(planData.createdBy || null);
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  // Calculate progress percentage
  const progress =
    data.checklist && data.checklist.length > 0
      ? Math.round(
          (checked.filter(Boolean).length / data.checklist.length) * 100
        )
      : 0;

  // Handle checkbox toggle
  const handleCheck = async (index) => {
    const updated = checked.map((val, i) => (i === index ? !val : val));
    setChecked(updated);
    // Persist to Firestore and update local data state for checklistDone
    const allDone = updated.length > 0 && updated.every(Boolean);
    await updateDoc(doc(db, "plans", planId), {
      checklistDone: updated,
      done: allDone,
    });
    setData((prev) => ({
      ...prev,
      checklistDone: updated,
      done: allDone,
    }));
  };

  // Default to today, but you can change this for testing
  const today = new Date();

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-xl font-[Cal_Sans]"><Spinner /></div>
      </div>
    );
  }

  return (
    <div className="size-full p-2 flex flex-col">
      <div className="sticky top-0 bg-white/40 backdrop-blur-md z-50">
        <div className="flex gap-2">
          <div className="text-3xl font-[Cal_Sans]">{data.name || "Plan"}</div>
          {/* Show "Done" only if all are checked, with transition */}
          <div
            className="bg-greenp3-6 rounded-sm px-4 flex gap-2 leading-3 items-center justify-center text-greendarkp3-5 transition-all duration-300"
            style={{
              opacity: checked.length > 0 && checked.every(Boolean) ? 1 : 0,
              transform: checked.length > 0 && checked.every(Boolean) 
                ? "scale(1)"
                : "scale(0.95)",
              pointerEvents: checked.length > 0 && checked.every(Boolean) ? "auto" : "none"
            }}
          >
            <CheckCircledIcon />
            Done
          </div>
        </div>
        <div className="text-xl font-[Cal_Sans] text-gray-500">
          {data.type || "Fitness"}
        </div>
        <div className="flex gap-2 items-center font-[Cal_Sans]">
          {progress}% 
          <div className="!h-[2vh] w-full bg-ruby-3 rounded-sm">
            <div
              className="bg-ruby-9 rounded-sm h-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full">
        {data.checklist &&
          data.checklist.map((item, index) => (
            <ChecklistCheckbox
              key={index}
              checked={checked[index] || false}
              onCheckedChange={() => handleCheck(index)}
              label={item}
              date={today} // Pass any date here for testing
              userId={userId}
            />
          ))}
      </div>
    </div>
  );
};

export default Plan;
