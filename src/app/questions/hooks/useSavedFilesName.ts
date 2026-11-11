"use client";

import type { SavedFile } from "@/app/types/question";
import { readStoredList, savedFileSchema } from "@/schemas/question.schema";
import { useQuery } from "@tanstack/react-query";

export function useSavedFilesName() {
  return useQuery({
    queryKey: ["savedFiles"],
    queryFn: (): SavedFile[] => readStoredList("files", savedFileSchema),
    staleTime: Infinity,
  });
}
