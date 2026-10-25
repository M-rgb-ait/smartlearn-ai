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

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const selectedFile = input.files?.[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      input.value = "";
      return;
    }

    setError("");

    // Clear previous quiz
    questionsMutation.reset();
    uploadMutation.reset();

    localStorage.removeItem("questions");
    queryClient.setQueryData(["savedQuestions"], []);

    try {
      // 1. Upload PDF
      const uploadData = await uploadMutation.mutateAsync(selectedFile);

      if (
        typeof uploadData.extractedText !== "string" ||
        !uploadData.extractedText.trim()
      ) {
        throw new Error("No text was extracted from the PDF.");
      }

      // 2. Generate questions
      const generatedQuestions = await questionsMutation.mutateAsync({
        text: uploadData.extractedText,
        numberOfQuestions: 5,
      });

      // 3. Save questions
      localStorage.setItem("questions", JSON.stringify(generatedQuestions));

      queryClient.setQueryData(["savedQuestions"], generatedQuestions);

      // 4. Save file metadata
      const savedFiles: SavedFile[] = JSON.parse(
        localStorage.getItem("files") || "[]",
      );

      const updatedFiles = [
        ...savedFiles,
        {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
        },
      ];

      localStorage.setItem("files", JSON.stringify(updatedFiles));

      queryClient.setQueryData(["savedFiles"], updatedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      input.value = "";
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <label htmlFor="pdf-file" className="block font-semibold">
          Choose a PDF file
        </label>

        <input
          id="pdf-file"
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          disabled={loading}
          className="block w-full rounded-lg border p-3"
        />
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Uploaded Files</h2>

        <ul>
          {savedFilesName.length === 0 ? (
            <li>No files uploaded yet.</li>
          ) : (
            savedFilesName.map((file, index) => (
              <li key={`${file.name}-${index}`}>{file.name}</li>
            ))
          )}
        </ul>
      </div>

      {loading && (
        <p role="status">
          {uploadMutation.isPending
            ? "Uploading PDF and extracting text..."
            : "Generating questions..."}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 p-3 text-red-700"
        >
          {error}
        </p>
      )}

      <Quiz questions={questions} />
    </div>
  );
}

const PdfUploader = memo(PdfUploaderComponent);

export default PdfUploader;
