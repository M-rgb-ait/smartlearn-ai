import type { SavedFile } from "@/app/types/question";

type Props = {
  files: SavedFile[];
  selectedFileId: string;
  loading: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function UploadedFiles({
  files,
  selectedFileId,
  loading,
  onSelect,
  onDelete,
}: Props) {
  return (
    <div className="space-y-3 rounded-2xl border bg-white p-5 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Uploaded Files</h2>

        <span aria-label={`${files.length} uploaded files`}>
          {files.length}
        </span>
      </div>

      {files.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-700 dark:text-gray-300">
          No files uploaded yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className={`flex items-center gap-2 rounded-xl border p-3 ${
                selectedFileId === file.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(file.id)}
                aria-pressed={selectedFileId === file.id}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span>PDF</span>

                <span className="min-w-0 flex-1 truncate text-sm">
                  {file.name}
                </span>

                <span className="text-xs text-green-700 dark:text-green-400">
                  Saved
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => onDelete(file.id)}
                aria-label={`Delete ${file.name}`}
                className="cursor-pointer text-red-700 disabled:opacity-40 dark:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
