"use client";

import { useQueryClient } from "@tanstack/react-query";
import { SavedFile } from "../types/question";
import { getSavedQuestions, writeStorage } from "../utils/storage";

type Props = {
  selectedFileId: string;
  files: SavedFile[];
  updateFileId: (id: string | null) => void;
  loading: boolean;
};

export function useFileActions({
  selectedFileId,
  files,
  updateFileId,
  loading,
}: Props) {
  const queryClient = useQueryClient();

  function deleteFile(fileId: string) {
    if (loading) return;

    const isSelectedFile = selectedFileId === fileId;

    const deletedIndex = files.findIndex((file) => file.id === fileId);

    if (deletedIndex === -1) return;

    const updatedFiles = files.filter((file) => file.id !== fileId);

    const updatedQuestions = getSavedQuestions().filter(
      (question) => question.fileId !== fileId,
    );

    // Update storage
    if (!writeStorage("files", updatedFiles)) return;

    if (!writeStorage("questions", updatedQuestions)) {
      writeStorage("files", files);
      return;
    }

    // Select next file, or previous last file
    const nextFile = updatedFiles[deletedIndex] ?? updatedFiles.at(-1);

    // Update URL before updating cache
    if (isSelectedFile) {
      updateFileId(nextFile?.id ?? null);
    }

    // Update cache once
    queryClient.setQueryData(["savedFiles"], updatedFiles);
    queryClient.setQueryData(["savedQuestions"], updatedQuestions);

    queryClient.removeQueries({
      queryKey: ["selectedQuestions", fileId],
    });

    if (!isSelectedFile) return;

    if (nextFile) {
      queryClient.setQueryData(
        ["selectedQuestions", nextFile.id],
        updatedQuestions.filter((question) => question.fileId === nextFile.id),
      );
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return { deleteFile };
}
