"use client";

import { SavedFile } from "@/app/types/question";
import { useQuery } from "@tanstack/react-query";

export function useSavedFilesName() {
  return useQuery({
    queryKey: ["savedFiles"],
    queryFn: (): SavedFile[] => {
      if (typeof window === "undefined") return [];

      return JSON.parse(localStorage.getItem("files") || "[]") as SavedFile[];
    },
    staleTime: Infinity,
  });
}
