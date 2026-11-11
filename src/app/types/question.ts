import { GeneratedQuestion } from "@/schemas/question.schema";

export type Question = GeneratedQuestion & {
  fileId?: string;
};

export type UploadPdfResponse = {
  message?: string;
  extractedText: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
};

export type SavedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  // status: "processing" | "completed" | "failed";
  hash?: string;
};
