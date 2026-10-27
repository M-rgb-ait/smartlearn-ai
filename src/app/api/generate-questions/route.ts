import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    if (!ai) {
      console.error("GEMINI_API_KEY is missing");

      return Response.json(
        { error: "Gemini API key is not configured." },
        { status: 500 },
      );
    }

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
  } catch (error: unknown) {
    console.error("Question generation failed:", error);

    const apiError = error as {
      status?: number;
      message?: string;
    };

    const status = apiError.status;

    if (status === 429) {
      return Response.json(
        {
          error:
            "Gemini request limit or quota exceeded. Please try again later.",
        },
        { status: 429 },
      );
    }

    if (status === 401 || status === 403) {
      return Response.json(
        { error: "Gemini API key is invalid or does not have permission." },
        { status: 502 },
      );
    }

    return Response.json(
      { error: "Failed to generate questions." },
      { status: 500 },
    );
  }
}
