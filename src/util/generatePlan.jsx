// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, Type } from "@google/genai";

// Accept an object with all plan fields
export async function generatePlan({
  name,
  type,
  prompt,
  difficulty,
  numChecks,
}) {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCk4PLuWeycGTTmt2hEqwqUNvvpD2AMW5A",
  });
  const config = {

    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: ["plan"],
      properties: {
        plan: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
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
          text: `You are a professional health and fitness coach. Based on the plan name, type, the user's experience level, the plan description below, and the number of checks, generate a daily checklist in JSON format for the user to follow.

The checklist should contain exactly ${numChecks} daily actions that are practical, actionable, and measurable. Avoid general statements; the plan should outline things the user can check off on a daily basis (e.g., "Drink 8 glasses of water," not "Stay hydrated").

Input:

Plan Name: ${name}
Plan Type: ${type}
Difficulty Level: ${difficulty}
Prompt (Plan Description): ${prompt}
Number of Checks: ${numChecks}

The JSON output should have:

planName: The name of the plan

planType: The type of the plan

difficulty: The experience level

numChecks: The number of checks (length of checklist array)

checklist: An array of exactly ${numChecks} daily actionable items as strings

Make the checklist:

Practical: The actions should be things the user can do each day.

Motivating: Include achievable, goal-oriented tasks that help keep the user on track.

Tailored: Ensure each item is in line with the user's goal, type of plan, and difficulty level.

Beginner/Intermediate/Advanced-appropriate: Adjust the difficulty of the checklist to suit the user's experience level.

The items should cover areas like:

Nutrition (e.g., "Eat a balanced breakfast with protein")

Physical activity (e.g., "Complete 30 minutes of cardio")

Hydration (e.g., "Drink 8 glasses of water")

Sleep habits (e.g., "Sleep at least 7 hours")

Mental wellness (only if applicable, e.g., "Practice 5 minutes of meditation")

Ensure the checklist contains exactly ${numChecks} items.`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `The user wants a daily checklist for a 'Thin Plan' designed for a beginner who is lactose intolerant, allergic to peanuts, and cannot walk.

Plan Name: Thin Plan
Difficulty: Beginner
Constraints/Preferences:
- Goal: Become thin (weight loss)
- Dietary Restrictions: Lactose intolerant, peanut allergy
- Physical Limitations: Cannot walk

Checklist should cover:
- Nutrition: Focus on weight loss, avoiding lactose and peanuts. Beginner-friendly.
- Physical Activity: Adapt exercises for someone who cannot walk. Focus on upper body and core, seated exercises. Beginner level intensity.
- Hydration: Standard hydration goals.
- Sleep: General sleep hygiene advice.
- Mental Wellness: Maybe a simple mindfulness/motivation item.

Checklist Items Draft:
1.  **Nutrition:**
    *   Eat 3 main meals and 1-2 small snacks focusing on whole foods (fruits, vegetables, lean proteins, whole grains). *Needs refinement for lactose/peanut allergy.* -> Eat 3 main meals and 1-2 small snacks focusing on whole, unprocessed foods (fruits, vegetables, lean proteins like chicken/fish/beans, safe grains). Ensure all foods are lactose-free and peanut-free. Check labels carefully.
    *   Track food intake using an app or journal. *Good for beginners.*
    *   Choose lactose-free dairy alternatives (e.g., almond milk, soy milk, oat milk - check labels) or calcium-rich non-dairy sources (e.g., leafy greens, fortified orange juice).
    *   Avoid all peanuts and products containing peanuts or peanut traces. Check food labels diligently.
    *   Focus on portion control for meals and snacks. Use smaller plates if helpful.
2.  **Physical Activity (Seated):**
    *   Complete 15-20 minutes of seated exercises (e.g., arm circles, seated marching - lifting knees if possible, seated twists, shoulder presses with light weights or water bottles).
    *   Try 10 minutes of seated resistance band exercises for upper body strength.
    *   Do 5-10 minutes of gentle seated stretching.
3.  **Hydration:**
    *   Drink at least 8 glasses (64 oz or about 2 liters) of water throughout the day. Keep a water bottle nearby.
4.  **Sleep:**
    *   Aim for 7-9 hours of quality sleep per night. Try to go to bed and wake up around the same time.
5.  **Mental Wellness:**
    *   Take 5 minutes for mindful breathing or reflect on one positive thing about your day.

Refining Checklist for JSON output:
- Combine similar items where possible.
- Make sure they are actionable daily tasks.
- Keep language simple and encouraging.

Final Checklist Items:
1.  "Eat 3 portion-controlled meals focusing on whole foods like vegetables, fruits, and lean proteins. Ensure all meals are lactose-free and peanut-free."
2.  "Have 1-2 small, healthy snacks if needed (e.g., fruit, lactose-free yogurt alternative, handful of safe nuts/seeds). Check labels for lactose and peanuts."
3.  "Track your food and drink intake in a journal or app."
4.  "Complete 20 minutes of seated exercises (e.g., arm raises, seated twists, shoulder presses with light weights/water bottles)."
5.  "Perform 10 minutes of gentle seated stretching."
6.  "Drink at least 8 glasses (64 oz / 2 liters) of water throughout the day."
7.  "Aim for 7-9 hours of sleep. Establish a relaxing pre-sleep routine."
8.  "Check food labels carefully for hidden lactose and peanuts before eating."
9.  "Take 5 minutes for mindful breathing or reflect on your progress today."

JSON Structure:
{
"planName": "Thin Plan",
"difficulty": "Beginner",
"checklist": [
"Item 1",
"Item 2",
...
]
}

Let's use the refined checklist items.`,
        },
        {
          text: `{
  "plan": [
    "Eat 3 portion-controlled meals focusing on whole foods like vegetables, fruits, and lean proteins. Ensure all meals are lactose-free and peanut-free.",
    "Have 1-2 small, healthy snacks if needed (e.g., fruit, lactose-free yogurt alternative, handful of safe nuts/seeds). Check labels for lactose and peanuts.",
    "Track your food and drink intake in a journal or app.",
    "Complete 20 minutes of seated exercises (e.g., arm raises, seated twists, shoulder presses with light weights/water bottles).",
    "Perform 10 minutes of gentle seated stretching.",
    "Drink at least 8 glasses (64 oz / 2 liters) of water throughout the day.",
    "Aim for 7-9 hours of sleep. Establish a relaxing pre-sleep routine.",
    "Check food labels carefully for hidden lactose and peanuts before eating.",
    "Take 5 minutes for mindful breathing or reflect on your progress today."
  ]
}`,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });
  console.log(JSON.parse(response.text));
  return JSON.parse(response.text);
}
