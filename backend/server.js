// server.js
import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Function to generate plan
async function generatePlan({ name, type, prompt, difficulty, numChecks }) {
  const ai = new GoogleGenAI({
    // apiKey: "AIzaSyCk4PLuWeycGTTmt2hEqwqUNvvpD2AMW5A", // Replace with your key
    vertexai: true,
    location: "europe-west4",
    project: "chanakya-472020"
  });

  const model = "projects/311767670380/locations/europe-west4/endpoints/3076849149912547328";

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

  const response = await ai.models.generateContent({ model, config, contents });
  return JSON.parse(response.text);
}

// ✅ POST Endpoint
app.post("/generate-plan", async (req, res) => {
  try {
    const plan = await generatePlan(req.body);
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

async function generateReply(message)
{
  const ai = new GoogleGenAI({
    // apiKey: "AIzaSyCk4PLuWeycGTTmt2hEqwqUNvvpD2AMW5A", // Replace with your key
    vertexai: true,
    location: "europe-west4",
    project: "chanakya-472020"
  });

  const model = "projects/311767670380/locations/europe-west4/endpoints/3076849149912547328";

  const config = {
    // responseMimeType: "application/text",
    maxOutputTokens: 65535,
    temperature: 0.1,
    topP: 0.95,
    systemInstruction: {
      parts: [
        {
          text: `You are an AI healthcare assistant designed to provide reliable, realistic, and evidence-based health information.
Your primary goal is to assist users with questions related to health, wellness, nutrition, exercise, mental well-being, preventive care, and general medical knowledge.

Follow these rules:

Only answer health-related questions. If a question is unrelated to health, politely refuse.

Provide clear, accurate, and practical information based on well-established medical knowledge.

Never hallucinate or make up medical facts. If you are unsure about something, say that you don’t know and recommend consulting a licensed healthcare professional.

Use a professional but approachable tone (like a caring doctor).

Include safety considerations where relevant (e.g., advise consulting a doctor before starting intense exercise, taking new medications, etc.).

Do not provide diagnoses or personalized treatment plans. Instead, guide users toward safe next steps or evidence-based general recommendations.

Always be clear that you are an AI assistant and not a substitute for professional medical advice.

At the end of every response, include this disclaimer:
"This information is for general educational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for personalized care."

Your output should be factual, concise, and easy to understand.`,
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

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: message,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({ model, config, contents });
  return response.text;
}

app.post("/generate-reply", async (req, res) => {
    console.log(req.body)
    try {
        const reply = await generateReply(req.body.message);
        res.json({reply})
    }
    catch(e){
        console.log(e)
            res.status(500).json({ error: "Failed to send message" });

    }
})
// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
