"use client";

import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useUploadPdf } from "../hooks/useUploadPdf";
import { useGenerateQuestions } from "@/app/questions/hooks/useGenerateQuestions";
import { useSavedQuestions } from "@/app/questions/hooks/useSavedQuestions";
import { useSavedFilesName } from "@/app/questions/hooks/useSavedFilesName";
import type { SavedFile } from "@/app/types/question";

import Quiz from "./Quiz";

function PdfUploaderComponent() {
  const queryClient = useQueryClient();

  const uploadMutation = useUploadPdf();
  const questionsMutation = useGenerateQuestions();

  // seva questions in hooks this hooks render in file quize
  const savedQuestionsQuery = useSavedQuestions();
  const questions = savedQuestionsQuery.data ?? [];

  // seva names in hooks
  const savedFilesQuery = useSavedFilesName();
  const savedFilesName = savedFilesQuery.data ?? [];

  const loading = uploadMutation.isPending || questionsMutation.isPending;

  const [error, setError] = useState("");
  // Clear previous quiz
  // questionsMutation.reset();
  // uploadMutation.reset();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);

    if (selectedFiles.length === 0) return;

    const invalidFile = selectedFiles.find(
      (file) =>
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf"),
    );

    if (invalidFile) {
      setError("Please select PDF files only.");
      input.value = "";
      return;
    }

    setError("");

    try {
      for (const selectedFile of selectedFiles) {
        // Upload PDF
        const uploadData = await uploadMutation.mutateAsync(selectedFile);

        if (
          typeof uploadData.extractedText !== "string" ||
          !uploadData.extractedText.trim()
        ) {
          throw new Error(`No text was extracted from ${selectedFile.name}.`);
        }

        // Generate questions
        const generatedQuestions = await questionsMutation.mutateAsync({
          text: uploadData.extractedText,
          numberOfQuestions: 5,
        });

        const fileId = crypto.randomUUID();

        const questionsWithFileId = generatedQuestions.map((question) => ({
          ...question,
          fileId,
        }));

        // Save questions
        const savedQuestions = JSON.parse(
          localStorage.getItem("questions") || "[]",
        );

        const updatedQuestions = [...savedQuestions, ...questionsWithFileId];

        localStorage.setItem("questions", JSON.stringify(updatedQuestions));

        queryClient.setQueryData(["savedQuestions"], updatedQuestions);

        // Save file metadata
        const savedFiles: SavedFile[] = JSON.parse(
          localStorage.getItem("files") || "[]",
        );

        const updatedFiles = [
          ...savedFiles,
          {
            id: fileId,
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
          },
        ];

        localStorage.setItem("files", JSON.stringify(updatedFiles));

        queryClient.setQueryData(["savedFiles"], updatedFiles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      input.value = "";
    }
  }
  function handleDeleteFile(fileId: string) {
    const savedFiles: SavedFile[] = JSON.parse(
      localStorage.getItem("files") || "[]",
    );

    const updatedFiles = savedFiles.filter((file) => file.id !== fileId);

    localStorage.setItem("files", JSON.stringify(updatedFiles));
    queryClient.setQueryData(["savedFiles"], updatedFiles);

    const savedQuestions = JSON.parse(
      localStorage.getItem("questions") || "[]",
    );

    const updatedQuestions = savedQuestions.filter(
      (question: { fileId: string }) => question.fileId !== fileId,
    );

    localStorage.setItem("questions", JSON.stringify(updatedQuestions));
    queryClient.setQueryData(["savedQuestions"], updatedQuestions);
  }
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* PDF Upload */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Upload your PDF
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a PDF file to extract its content and generate quiz
            questions.
          </p>
        </div>

        <label
          htmlFor="pdf-file"
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors dark:border-gray-600 ${
            loading
              ? "cursor-not-allowed opacity-50"
              : "hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
          }`}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-2xl dark:bg-blue-950">
            📄
          </span>

          <span className="font-semibold text-gray-800 dark:text-gray-100">
            Choose a PDF file
          </span>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            PDF files only
          </span>

          <input
            id="pdf-file"
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={handleFileChange}
            disabled={loading}
            className="sr-only"
          />
        </label>
      </div>

      {/* Uploaded Files */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">
            Uploaded Files
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {savedFilesName.length}
          </span>
        </div>

        {savedFilesName.length === 0 ? (
          <div className="rounded-xl bg-gray-50 px-4 py-8 text-center dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No files uploaded yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {savedFilesName.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-bold text-red-600">
                  PDF
                </span>

                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                  {file.name}
                </span>

                <span className="text-xs text-green-600">Saved</span>

                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.id)}
                  aria-label={`Delete ${file.name}`}
                  title="Delete file"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
        >
          <span className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

          <span>
            {uploadMutation.isPending
              ? "Uploading PDF and extracting text..."
              : "Generating questions..."}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {/* Quiz */}
      <Quiz questions={questions} />
    </div>
  );
}

const PdfUploader = memo(PdfUploaderComponent);

export default PdfUploader;
