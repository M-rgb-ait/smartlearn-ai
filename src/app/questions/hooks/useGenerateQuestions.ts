"use client";

import { useMutation } from "@tanstack/react-query";
import { generateQuestions } from "../actions/questions.api";

export function useGenerateQuestions() {
  return useMutation({
    mutationFn: ({
      text,
      numberOfQuestions,
    }: {
      text: string;
      numberOfQuestions?: number;
    }) => generateQuestions(text, numberOfQuestions),
  });
}
