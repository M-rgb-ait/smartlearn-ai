import { UploadPdfResponse } from "@/app/types/question";

export async function uploadPdf(file: File): Promise<UploadPdfResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/pdf", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload PDF.");
  }

  if (typeof data.extractedText !== "string" || !data.extractedText.trim()) {
    throw new Error("No text was extracted from the PDF.");
  }

  return data as UploadPdfResponse;
}
