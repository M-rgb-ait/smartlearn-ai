"use client";

import type { Question } from "@/app/types/question";
import { useQuery } from "@tanstack/react-query";

export function useSavedQuestions() {
  return useQuery({
    queryKey: ["savedQuestions"],

    queryFn: (): Question[] => {
      const savedQuestions = localStorage.getItem("questions");

      return savedQuestions ? JSON.parse(savedQuestions) : [];
    },

    staleTime: Infinity,
  });
}
