import { GoogleGenAI } from "@google/genai";
import { connection } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function GET() {
  await connection();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello in Arabic in one short sentence.",
    });

    return Response.json({
      message: response.text,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    return Response.json(
      { error: "Failed to generate content." },
      { status: 500 },
    );
  }
}
