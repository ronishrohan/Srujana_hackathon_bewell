// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, Type } from "@google/genai";

export async function generatePlan({
  name,
  type,
  prompt,
  difficulty,
  numChecks,
}) {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCk4PLuWeycGTTmt2hEqwqUNvvpD2AMW5A",
    // vertexai: true,
    // location: "europe-west4"
  });

  // const model = "gemini-2.0-flash";
  const  model = "projects/311767670380/locations/europe-west4/endpoints/3076849149912547328"


  // ✅ Moved the system prompt to system_instruction
  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: ["planName", "planType", "difficulty", "numChecks", "checklist"],
      properties: {
        planName: { type: Type.STRING },
        planType: { type: Type.STRING },
        difficulty: { type: Type.STRING },
        numChecks: { type: Type.NUMBER },
        checklist: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    },
    maxOutputTokens: 65535,
    temperature: 1,
    topP: 0.95,
    systemInstruction: {
      parts: [
        {
          text: `You are an AI assistant that only talks about topics related to:
- Healthcare (general health, illness prevention, how the body works, etc.)
- Fitness (exercise, strength, cardio, stretching, etc.)
- Wellbeing (mental health tips, stress, sleep, healthy habits, etc.)

Rules:
1. If someone asks about anything NOT related to health, fitness, or wellbeing (like tech, politics, coding, movies, etc.), do NOT answer. Instead, tell them you can only help with health-related questions.
2. Do NOT give medical diagnoses or suggest specific treatments. Always recommend seeing a doctor or a licensed professional for serious health concerns.
3. Be safe. Don’t suggest anything risky, dangerous, or unhealthy (like crash diets, unsafe supplements, or extreme workouts).
4. Be respectful and helpful to everyone — including beginners, older adults, people with disabilities, or anyone else.
5. If you don’t know something, it’s okay to say so. Never make up answers.

Focus only on health, fitness, nutrition, and wellbeing. Be friendly and clear.`,
        },
      ],
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
    ],
  };

  // ✅ Removed system role from contents, leaving only user + model
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a professional health and fitness coach. Based on the plan name, type, the user's experience level, the plan description below, and the number of checks, generate a daily checklist in JSON format for the user to follow.
The checklist must contain exactly ${numChecks} daily actions that are practical, actionable, and measurable.

Plan Name: ${name}
Plan Type: ${type}
Difficulty Level: ${difficulty}
Prompt (Plan Description): ${prompt}
Number of Checks: ${numChecks}

JSON Output must include:
- planName
- planType
- difficulty
- numChecks
- checklist (array of exactly ${numChecks} actionable items)

Checklist should cover:
- Nutrition (e.g., "Eat a balanced breakfast with protein")
- Physical activity (e.g., "Complete 30 minutes of cardio")
- Hydration (e.g., "Drink 8 glasses of water")
- Sleep habits (e.g., "Sleep at least 7 hours")
- Mental wellness (only if applicable)

Ensure the output is a valid JSON object.`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model:"gemini-2.0-flash",
    config,
    contents,
  });
  console.log(JSON.parse(response.text))

  return JSON.parse(response.text);
}

// Example usage:
// (async () => {
//   const plan = await generatePlan({
//     name: "Weight Loss Boost",
//     type: "treatment",
//     prompt: "Help me lose weight with home-friendly tips.",
//     difficulty: "easy",
//     numChecks: 10,
//   });
//   console.log(plan);
// })();
