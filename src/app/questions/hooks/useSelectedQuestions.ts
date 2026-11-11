"use client";

import type { Question } from "@/app/types/question";
import {
  readStoredList,
  storedQuestionSchema,
} from "@/schemas/question.schema";
import { useQuery } from "@tanstack/react-query";

export function useSelectedQuestions(fileId: string) {
  return useQuery({
    queryKey: ["selectedQuestions", fileId],

    queryFn: (): Question[] =>
      readStoredList("questions", storedQuestionSchema).filter(
        (question) => question.fileId === fileId,
      ),

    enabled: !!fileId,
    staleTime: Infinity,
  });
}
