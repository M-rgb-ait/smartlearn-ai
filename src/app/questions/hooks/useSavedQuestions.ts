"use client";

import { Question } from "@/app/types/question";
import { useQuery } from "@tanstack/react-query";

export function useSavedQuestions() {
  return useQuery({
    queryKey: ["savedQuestions"],

    queryFn: (): Question[] => {
      const savedQuestions = localStorage.getItem("questions");

      if (!savedQuestions) return [];

      return JSON.parse(savedQuestions) as Question[];
    },

    staleTime: Infinity,
  });
}
