import { Question } from "@/app/types/question";

type GenerateQuestionsResponse =
  | Question[]
  | {
      questions: Question[];
    };

export async function generateQuestions(
  text: string,
  numberOfQuestions = 5,
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

  const data: GenerateQuestionsResponse & {
    error?: string;
  } = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate questions.");
  }

  const questions = Array.isArray(data) ? data : data.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("The AI did not return any questions.");
  }

  const isValid = questions.every(
    (question) =>
      typeof question.question === "string" &&
      Array.isArray(question.options) &&
      question.options.length > 1 &&
      question.options.every((option) => typeof option === "string") &&
      Number.isInteger(question.correctAnswer) &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < question.options.length,
  );

  if (!isValid) {
    throw new Error("Some generated questions have an invalid format.");
  }

  return questions;
}
