// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, Type } from "@google/genai";

// Accept an object with session input values
export async function generateSession({
  name,
  type,
  description,
  difficulty,
  totalTime,
}) {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCk4PLuWeycGTTmt2hEqwqUNvvpD2AMW5A", // Replace with your actual API key
  });

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["title", "description", "time", "instructions"],
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          time: { type: Type.STRING },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  };

  const model = "gemini-2.0-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a fitness expert. Based on the session name, type, difficulty level, plan description, and total time available (in minutes), break the session into multiple parts.

Each part should include:
- A short title (e.g., "Warmup", "Core Training", "Cooldown")
- A one-line description
- Time in minutes (as a string)
- 3-5 clear, actionable instructions

Ensure:
- The total time of all parts adds up to ${totalTime} minutes.
- The session is tailored to a ${difficulty} user.
- The content is practical, encouraging, and type-appropriate.

Input:
Name: ${name}
Type: ${type}
Description: ${description}
Difficulty: ${difficulty}
Total Time: ${totalTime} minutes

Return the session in JSON array format, where each object includes:
{
  "title": "...",
  "description": "...",
  "time": "...",
  "instructions": ["...", "...", "..."]
}`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const sessionPlan = JSON.parse(response.text);
  console.log(sessionPlan);
  return sessionPlan;
}
