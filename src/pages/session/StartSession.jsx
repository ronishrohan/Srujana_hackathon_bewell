import React, { useState } from 'react'
import { TextField, TextArea, Select, Button, Checkbox } from "@radix-ui/themes";
import { generateSession } from '../../util/generateSession';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const StartSession = () => {
  const [sessionName, setSessionName] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [timeLimit, setTimeLimit] = useState("15");
  const [loading, setLoading] = useState(false);
  const [voiceAssisted, setVoiceAssisted] = useState(false);
  const navigate = useNavigate()

  const handleStart = async () => {
    setLoading(true);
    const session = await generateSession({
      name: sessionName,
      type: sessionType,
      description: sessionDescription,
      difficulty,
      totalTime: timeLimit,
      voiceAssisted, // changed from voiceover
    });

    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    const createdSession = await addDoc(collection(db, "sessions"), {
        data: session, 
        createdBy: userId,
        createdAt: new Date(),
        name: sessionName,
        type: sessionType,
        description: sessionDescription,
        voiceAssisted // changed from voiceover
    })

    navigate(`/session/${createdSession.id}`);

  };

  return (
    <div className="p-2 flex flex-col gap-2 size-full items-center justify-center">
      <div className="w-[40vw] flex flex-col gap-2">
        <div className="text-2xl font-[Cal_Sans]">Start a new session</div>
        <TextField.Root
          size="3"
          placeholder="Session Name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
        />
        <TextField.Root
          size="3"
          placeholder="Session Type"
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
        />
        <TextArea
          size="3"
          resize={"vertical"}
          placeholder="What is this session for"
          value={sessionDescription}
          onChange={(e) => setSessionDescription(e.target.value)}
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
        {/* Time Limit Select */}
        <Select.Root size="3" value={timeLimit} onValueChange={setTimeLimit}>
          <Select.Trigger placeholder="Time Limit" />
          <Select.Content>
            <Select.Group>
              <Select.Label>Time Limit</Select.Label>
              <Select.Item value="15">15 min</Select.Item>
              <Select.Item value="30">30 min</Select.Item>
              <Select.Item value="60">1 hour</Select.Item>
              <Select.Item value="120">2 hours</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
        {/* Voiceover Checkbox */}
        <label className="flex items-center gap-2 select-none cursor-pointer">
          <Checkbox checked={voiceAssisted} onCheckedChange={setVoiceAssisted} />
          <span>Enable voice assistance</span>
        </label>
        <Button
            loading={loading}
          variant="solid"
          size="3"
          color="ruby"
          className="!h !p-4"
          onClick={handleStart}
        >
          Start Session
        </Button>
      </div>
    </div>
  );
};

export default StartSession;