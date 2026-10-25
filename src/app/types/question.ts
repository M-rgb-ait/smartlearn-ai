export type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export type UploadPdfResponse = {
  message?: string;
  extractedText: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
};

export type SavedFile = {
  name: string;
  size: number;
  type: string;
};
