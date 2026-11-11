import { Question } from "@/app/types/question";

type GenerateQuestionsResponse =
  | Question[]
  | {
      success?: boolean;
      questions: Question[];
    };

type ApiErrorResponse = {
  error?: string;
};

export async function generateQuestions(
  text: string,
  numberOfQuestions = 3,
): Promise<Question[]> {
  const response = await fetch("/api/generate-questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      numberOfQuestions,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as
    | GenerateQuestionsResponse
    | ApiErrorResponse;

  if (!response.ok) {
    const errorMessage =
      "error" in data && typeof data.error === "string"
        ? data.error
        : "Question generation failed. Please try again.";

    throw new Error(errorMessage);
  }

  const questions = Array.isArray(data)
    ? data
    : "questions" in data
      ? data.questions
      : [];

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("The AI did not return any questions.");
  }

  return questions;
}
