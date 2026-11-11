export function PdfUploaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl animate-pulse space-y-6">
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-36 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}
