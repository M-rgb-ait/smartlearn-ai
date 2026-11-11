"use client";

import PdfUploaderComponent from "@/app/components/PdfUploader";
import { PdfUploaderSkeleton } from "@/skeleton/Pdfuploaderskeleton";
import { Suspense } from "react";

export default function PdfUploader() {
  return (
    <Suspense fallback={<PdfUploaderSkeleton />}>
      <PdfUploaderComponent />
    </Suspense>
  );
}
