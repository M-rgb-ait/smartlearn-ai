import {
  HashedFile,
  ProcessDependencies,
  ProcessResult,
} from "@/app/types/pdf";
import { Question, SavedFile } from "@/app/types/question";
import {
  getSavedFiles,
  getSavedQuestions,
  writeStorage,
} from "@/app/utils/storage";

export async function processPdfFiles(
  items: HashedFile[],
  dependencies: ProcessDependencies,
  initialErrors: string[] = [],
  numberOfQuestions = 3,
): Promise<ProcessResult> {
  const errors = [...initialErrors];
  const failed: HashedFile[] = [];

  for (const item of items) {
    const { file, hash } = item;
    const fileId = crypto.randomUUID();

    try {
      // 1. Upload PDF
      const uploadData = await dependencies.upload(file);

      if (
        typeof uploadData.extractedText !== "string" ||
        !uploadData.extractedText.trim()
      ) {
        throw new Error("No text was extracted from this file.");
      }

      // 2. Generate questions
      const generatedQuestions = await dependencies.generate({
        text: uploadData.extractedText,
        numberOfQuestions,
      });

      if (generatedQuestions.length === 0) {
        throw new Error("No questions were generated.");
      }

      const questions: Question[] = generatedQuestions.map((question) => ({
        ...question,
        fileId,
      }));

      // 3. Save questions
      const previousQuestions = getSavedQuestions();
      const updatedQuestions = [...previousQuestions, ...questions];

      if (!writeStorage("questions", updatedQuestions)) {
        throw new Error("Storage is full. Delete some files and try again.");
      }

      // 4. Save file
      const newFile: SavedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        hash,
      };

      const previousFiles = getSavedFiles();
      const updatedFiles = [...previousFiles, newFile];

      if (!writeStorage("files", updatedFiles)) {
        writeStorage("questions", previousQuestions);

        throw new Error("Storage is full. Delete some files and try again.");
      }

      // 5. Update cache
      dependencies.onSaved(newFile, questions);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);

      failed.push(item);

      errors.push(
        `${file.name}: ${
          error instanceof Error ? error.message : "Something went wrong."
        }`,
      );
    }
  }

  return { errors, failed };
}
