import { Button, TextArea, TextField } from "@radix-ui/themes";
import { generatePlan } from "../../util/generatePlan";
import React, { useState, useTransition } from "react";
import { Select } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
const CreatePlan = () => {
  // State for all inputs
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState("");
  const [planPrompt, setPlanPrompt] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [numChecks, setNumChecks] = useState("5");
  const [pending, startTransition] = useTransition(false);
  const navigate = useNavigate()
  const handleCreate = async () => {
    startTransition(async () => {
      const data = await generatePlan({
        name: planName,
        type: planType,
        prompt: planPrompt,
        difficulty,
        numChecks: Number(numChecks),
      });

      // Get the checklist array from the returned data
      const checklist = data.plan || [];

      // Get the current user id
      const user = auth.currentUser;
      const userId = user ? user.uid : null;

      // Create an array of booleans for checklist completion
      const checklistDone = checklist.map(() => false);

      // Store the plan in Firestore
      const plan = await addDoc(collection(db, "plans"), {
        name: planName,
        type: planType,
        prompt: planPrompt,
        difficulty,
        numChecks: Number(numChecks),
        checklist,
        checklistDone,
        createdBy: userId,
        createdAt: new Date(),
      });

      navigate(`/plan/${plan.id}`);
    });
  };

  return (
    <div className="p-2 flex flex-col gap-2 size-full items-center justify-center">
      <div className="w-[40vw] flex flex-col gap-2">
        <div className="text-2xl font-[Cal_Sans]">Create a new plan</div>
        <TextField.Root
          size="3"
          placeholder="Plan Name"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
        />
        <TextField.Root
          size="3"
          placeholder="Plan Type"
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
        />
        <TextArea
          size="3"
          resize={"vertical"}
          placeholder="What is this plan for"
          value={planPrompt}
          onChange={(e) => setPlanPrompt(e.target.value)}
        />
        <Select.Root size="3" value={difficulty} onValueChange={setDifficulty}>
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              <Select.Label>Difficulty</Select.Label>
              <Select.Item value="Beginner">Beginner</Select.Item>
              <Select.Item value="Intermediate">Intermediate</Select.Item>
              <Select.Item value="Advanced">Advanced</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
        {/* Number of Checks Select */}
        <Select.Root size="3" value={numChecks} onValueChange={setNumChecks}>
          <Select.Trigger placeholder="Number of Checks" />
          <Select.Content>
            <Select.Group>
              <Select.Label>Number of Checks</Select.Label>
              <Select.Item value="5">5</Select.Item>
              <Select.Item value="10">10</Select.Item>
              <Select.Item value="15">15</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
        <Button
          loading={pending}
          variant="solid"
          size="3"
          color="green"
          className="!h !p-4"
          onClick={handleCreate}
        >
          Create
        </Button>
      </div>
    </div>
  );
};

export default CreatePlan;
