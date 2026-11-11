"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGenerateQuestions } from "@/app/questions/hooks/useGenerateQuestions";

import type {
  HashedFile,
  ProcessInput,
  ProcessResult,
  ProcessDependencies,
} from "@/app/types/pdf";

import { getSavedFiles, getSavedQuestions } from "@/app/utils/storage";

import { hashFile } from "@/app/utils/hashFile";
import { useUploadPdf } from "../input/hooks/useUploadPdf";
import { processPdfFiles } from "../input/actions/processPdfFiles";
import { validateFiles } from "../utils/validateFiles";

export function usePdfProcessing() {
  const queryClient = useQueryClient();

  const uploadMutation = useUploadPdf();
  const questionsMutation = useGenerateQuestions();

  // Update React Query cache after successfully saving a file
  const dependencies: ProcessDependencies = {
    upload: (file) => uploadMutation.mutateAsync(file),

    generate: (data) => questionsMutation.mutateAsync(data),

    onSaved: (file, questions) => {
      queryClient.setQueryData(["savedFiles"], getSavedFiles());

      queryClient.setQueryData(["savedQuestions"], getSavedQuestions());

      queryClient.setQueryData(["selectedQuestions", file.id], questions);
    },
  };

  async function runProcess(input: ProcessInput): Promise<ProcessResult> {
    const { numberOfQuestions } = input;

    // Retry failed files
    if ("retry" in input) {
      return processPdfFiles(input.retry, dependencies, [], numberOfQuestions);
    }

    // Validate files
    const { validFiles, invalidFiles } = validateFiles(input.files);

    const validationErrors = invalidFiles.map(
      ({ file, error }) => `${file.name}: ${error}`,
    );

    if (validFiles.length === 0) {
      throw new Error(validationErrors.join("\n"));
    }

    // Check duplicate files using SHA-256
    const savedHashes = new Set(
      getSavedFiles()
        .map((file) => file.hash)
        .filter(Boolean),
    );

    const seenHashes = new Set<string>();

    const hashedFiles: HashedFile[] = [];
    const duplicates: string[] = [];

    try {
      for (const file of validFiles) {
        const hash = await hashFile(file);

        if (savedHashes.has(hash) || seenHashes.has(hash)) {
          duplicates.push(file.name);
          continue;
        }

        seenHashes.add(hash);

        hashedFiles.push({
          file,
          hash,
        });
      }
    } catch {
      throw new Error("Could not read the selected file. Please try again.");
    }

    const skippedErrors = [
      ...validationErrors,
      ...duplicates.map((name) => `${name}: already uploaded, skipped.`),
    ];

    if (hashedFiles.length === 0) {
      throw new Error(skippedErrors.join("\n"));
    }

    // Process valid and non-duplicate files
    return processPdfFiles(
      hashedFiles,
      dependencies,
      skippedErrors,
      numberOfQuestions,
    );
  }

  const mutation = useMutation({
    mutationFn: runProcess,
  });

  const { mutate, reset } = mutation;

  return {
    mutate,
    reset,

    loading: mutation.isPending,

    failedFiles: mutation.data?.failed ?? [],

    // آخر عدد أسئلة اتطلب (React Query بيحتفظ بمدخلات آخر mutation)
    numberOfQuestions: mutation.variables?.numberOfQuestions,

    errorMessage:
      mutation.error?.message ?? mutation.data?.errors.join("\n") ?? "",

    uploadMutation: {
      isPending: uploadMutation.isPending,
    },

    questionsMutation: {
      isPending: questionsMutation.isPending,
    },
  };
}
