import { Question, SavedFile } from "./question";

export type HashedFile = {
  file: File;
  hash: string;
};

export type ProcessInput =
  | { files: File[]; numberOfQuestions?: number }
  | { retry: HashedFile[]; numberOfQuestions?: number };

export type ProcessResult = {
  errors: string[];
  failed: HashedFile[];
};

export type ProcessDependencies = {
  upload: (file: File) => Promise<{
    extractedText: string;
  }>;
  generate: (input: {
    text: string;
    numberOfQuestions: number;
  }) => Promise<Question[]>;
  onSaved: (file: SavedFile, questions: Question[]) => void;
};
