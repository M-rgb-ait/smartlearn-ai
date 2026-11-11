type Props = {
  loading: boolean;
  uploading: boolean;
  generating: boolean;
};

export default function UploadStatus({
  loading,
  uploading,
  generating,
}: Props) {
  if (!loading) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
    >
      <span className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

      <span>
        {uploading
          ? "Uploading PDF and extracting text..."
          : generating
            ? "Generating questions..."
            : "Checking files..."}
      </span>
    </div>
  );
}
