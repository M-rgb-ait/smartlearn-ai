import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, numberOfQuestions = 5 } = body;

    if (typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "PDF text is required" }, { status: 400 });
    }

    const count = Number(numberOfQuestions);

    if (!Number.isInteger(count) || count < 1 || count > 10) {
      return Response.json(
        { error: "numberOfQuestions must be between 1 and 10" },
        { status: 400 },
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Generate exactly ${count} multiple-choice questions based only
on the educational content below.

Return valid JSON in this format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

correctAnswer must be the zero-based index of the correct option.
Make the questions clear and avoid duplicate questions.

Educational content:
${text.slice(0, 30000)}
      `,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text ?? "");

    if (!Array.isArray(result.questions) || result.questions.length !== count) {
      throw new Error("Invalid questions response");
    }

    return Response.json({
      success: true,
      questions: result.questions,
    });
  } catch (error) {
    console.error("Question generation failed:", error);

    return Response.json(
      { error: "Failed to generate questions" },
      { status: 500 },
    );
  }
}
