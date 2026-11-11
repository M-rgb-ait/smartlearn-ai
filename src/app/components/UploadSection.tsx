"use client";

import { useRef } from "react";

const QUESTION_COUNTS = [3, 5, 7, 10];
const DEFAULT_QUESTION_COUNT = 3;

type Props = {
  loading: boolean;
  onFilesSelected: (files: File[], numberOfQuestions: number) => void;
};

export default function UploadSection({ loading, onFilesSelected }: Props) {
  // الـ select غير مُتحكَّم فيه: بنقرأ قيمته وقت الاختيار بدل ما نخزّنها في state
  const countRef = useRef<HTMLSelectElement>(null);

  function selectedCount() {
    return Number(countRef.current?.value) || DEFAULT_QUESTION_COUNT;
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);

    event.currentTarget.value = "";

    onFilesSelected(files, selectedCount());
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    delete event.currentTarget.dataset.dragging;

    if (loading) return;

    onFilesSelected(Array.from(event.dataTransfer.files), selectedCount());
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm dark:bg-gray-900">
      <h2 className="text-lg font-bold">Upload your PDF</h2>

      <p className="text-sm text-gray-700 dark:text-gray-300">
        Select one or more PDF files to generate quiz questions.
      </p>

      <div className="flex items-center gap-3">
        <label htmlFor="question-count" className="text-sm font-medium">
          Questions per file
        </label>

        <select
          id="question-count"
          ref={countRef}
          defaultValue={DEFAULT_QUESTION_COUNT}
          disabled={loading}
          className="rounded-lg border bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:bg-gray-900"
        >
          {QUESTION_COUNTS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>

      <label
        htmlFor="pdf-file"
        onDragOver={(event) => {
          event.preventDefault();

          if (!loading) {
            event.currentTarget.dataset.dragging = "true";
          }
        }}
        onDragLeave={(event) => {
          delete event.currentTarget.dataset.dragging;
        }}
        onDrop={handleDrop}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 data-[dragging=true]:border-blue-500 data-[dragging=true]:bg-blue-50 dark:data-[dragging=true]:bg-blue-950/30"
      >
        <span className="text-3xl" aria-hidden="true">
          📄
        </span>

        <span className="font-semibold">Choose or drop a PDF file</span>

        <span className="text-sm text-gray-700 dark:text-gray-300">
          PDF files only, up to 4MB each
        </span>

        <input
          id="pdf-file"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          disabled={loading}
          onChange={handleChange}
          className="sr-only"
        />
      </label>
    </div>
  );
}
