"use client";

import { Question } from "@/app/types/question";
import { memo, useState } from "react";

type QuizProps = {
  questions: Question[];
};

function QuizComponent({ questions }: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const score = questions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctAnswer ? 1 : 0);
  }, 0);

  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  function handleAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: optionIndex,
    }));

    setError("");
  }

  function handleSubmit() {
    if (questions.some((_, index) => answers[index] === undefined)) {
      setError("Please answer every question before submitting.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
    setError("");
  }

  if (questions.length === 0) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">
        {submitted ? "Quiz Results" : "Your Quiz"}
      </h2>

      {submitted && (
        <div className="space-y-2 rounded-xl border p-5">
          <p className="text-xl font-bold">
            Your Score: {score} / {questions.length}
          </p>
          <p className="text-lg">Percentage: {percentage}%</p>
          <p>
            {percentage >= 50
              ? "Good job! Keep learning."
              : "Keep practicing and try again!"}
          </p>
        </div>
      )}

      {questions.map((question, index) => (
        <div
          key={`${question.question}-${index}`}
          className="space-y-3 rounded-xl border p-4"
        >
          <h3 className="font-semibold">
            {index + 1}. {question.question}
          </h3>

          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const selected = answers[index] === optionIndex;
              const correct = optionIndex === question.correctAnswer;

              let optionClass = "flex items-start gap-3 rounded-lg border p-3";

              if (submitted && correct) {
                optionClass += " border-green-600 bg-green-50 text-green-900";
              } else if (submitted && selected && !correct) {
                optionClass += " border-red-600 bg-red-50 text-red-900";
              } else if (selected) {
                optionClass += " border-blue-600 bg-blue-50";
              }

              return (
                <label
                  key={optionIndex}
                  className={`${optionClass} ${
                    submitted ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={optionIndex}
                    checked={selected}
                    disabled={submitted}
                    onChange={() => handleAnswer(index, optionIndex)}
                    className="mt-1"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          {submitted && (
            <div className="space-y-1 text-sm">
              <p
                className={
                  answers[index] === question.correctAnswer
                    ? "font-semibold text-green-700"
                    : "font-semibold text-red-700"
                }
              >
                {answers[index] === question.correctAnswer
                  ? "Correct!"
                  : "Incorrect."}
              </p>

              <p>
                Correct answer:{" "}
                <strong>{question.options[question.correctAnswer]}</strong>
              </p>

              {question.explanation && <p>{question.explanation}</p>}
            </div>
          )}
        </div>
      ))}

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          Submit Answers
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRetry}
          className="w-full rounded-lg border px-5 py-3 font-semibold"
        >
          Try Again
        </button>
      )}
    </section>
  );
}

const Quiz = memo(QuizComponent);

export default Quiz;
