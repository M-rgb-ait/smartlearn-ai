import { UploadPdfResponse } from "@/app/types/question";

type UploadApiResponse = {
  error?: unknown;
  extractedText?: unknown;
};

function fallbackMessage(status: number): string {
  if (status === 413) return "The PDF is too large to upload (max 4MB).";
  if (status === 429) {
    return "Too many requests. Please wait a minute and try again.";
  }
  return "Failed to upload PDF.";
}

export async function uploadPdf(file: File): Promise<UploadPdfResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/pdf", {
    method: "POST",
    body: formData,
  });

  // المنصة (زي Vercel) ممكن ترد بنص عادي مش JSON، فنمسك الخطأ
  const data = (await response
    .json()
    .catch(() => null)) as UploadApiResponse | null;

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" && data.error
        ? data.error
        : fallbackMessage(response.status),
    );
  }

  if (typeof data?.extractedText !== "string" || !data.extractedText.trim()) {
    throw new Error("No text was extracted from the PDF.");
  }

  return data as unknown as UploadPdfResponse;
}
