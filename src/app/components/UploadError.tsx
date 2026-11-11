import type { HashedFile } from "@/app/types/pdf";

type Props = {
  error: string;
  failedFiles: HashedFile[];
  onDismiss: () => void;
  onRetry: () => void;
};

export default function UploadError({
  error,
  failedFiles,
  onDismiss,
  onRetry,
}: Props) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 whitespace-pre-line">{error}</p>

        <button onClick={onDismiss} aria-label="Dismiss error">
          ✕
        </button>
      </div>

      {failedFiles.length > 0 && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
        >
          {failedFiles.length === 1
            ? "Retry"
            : `Retry ${failedFiles.length} failed files`}
        </button>
      )}
    </div>
  );
}
