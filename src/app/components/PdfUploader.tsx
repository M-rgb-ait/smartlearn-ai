"use client";

import { useSavedFilesName } from "../questions/hooks/useSavedFilesName";
import { usePdfProcessing } from "../hooks/usePdfProcessing";
import { useFileSelection } from "../hooks/useFileSelection";
import { useSelectedQuestions } from "../questions/hooks/useSelectedQuestions";
import { useFileActions } from "../hooks/useFileActions";
import UploadSection from "./UploadSection";
import UploadedFiles from "./UploadedFiles";
import UploadStatus from "./UploadStatus";
import UploadError from "./UploadError";
import Quiz from "../input/components/Quiz";

export default function PdfUploaderComponent() {
  const savedFilesQuery = useSavedFilesName();
  const files = savedFilesQuery.data ?? [];

  const processing = usePdfProcessing();

  const { selectedFileId, selectFile, updateFileId } = useFileSelection(files);

  const selectedQuestionsQuery = useSelectedQuestions(selectedFileId);

  const { deleteFile } = useFileActions({
    selectedFileId,
    files,
    updateFileId,
    loading: processing.loading,
  });

  function clearError() {
    if (!processing.loading) {
      processing.reset();
    }
  }

  function handleSelectFile(fileId: string) {
    if (fileId === selectedFileId) return;

    clearError();
    selectFile(fileId);
  }

  function handleDeleteFile(fileId: string) {
    clearError();
    deleteFile(fileId);
  }

  function handleFilesSelected(selected: File[], numberOfQuestions: number) {
    if (!selected.length || processing.loading) return;

    processing.mutate({ files: selected, numberOfQuestions });
  }

  function handleRetry() {
    if (processing.loading || processing.failedFiles.length === 0) {
      return;
    }

    processing.mutate({
      retry: processing.failedFiles,
      // نفس العدد اللي اتختار في المحاولة الأولى (محفوظ في الـ mutation نفسها)
      numberOfQuestions: processing.numberOfQuestions,
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <UploadSection
        loading={processing.loading}
        onFilesSelected={handleFilesSelected}
      />

      <UploadedFiles
        files={files}
        selectedFileId={selectedFileId}
        loading={processing.loading}
        onSelect={handleSelectFile}
        onDelete={handleDeleteFile}
      />

      <UploadStatus
        loading={processing.loading}
        uploading={processing.uploadMutation.isPending}
        generating={processing.questionsMutation.isPending}
      />

      <UploadError
        error={processing.errorMessage}
        failedFiles={processing.failedFiles}
        onDismiss={clearError}
        onRetry={handleRetry}
      />

      <Quiz
        key={selectedFileId}
        questions={selectedQuestionsQuery.data ?? []}
      />
    </div>
  );
}
