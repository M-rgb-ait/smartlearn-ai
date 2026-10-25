"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadPdf } from "../actions/Pdf-api-Uploader";

export function useUploadPdf() {
  return useMutation({
    mutationFn: uploadPdf,
  });
}
