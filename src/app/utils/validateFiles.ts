import { fileSchema } from "@/schemas/fileSchema";

type InvalidFile = {
  file: File;
  error: string;
};

type ValidationResult = {
  validFiles: File[];
  invalidFiles: InvalidFile[];
};

export function validateFiles(files: File[]): ValidationResult {
  const validFiles: File[] = [];
  const invalidFiles: InvalidFile[] = [];

  for (const file of files) {
    const result = fileSchema.safeParse(file);

    if (result.success) {
      validFiles.push(file);
    } else {
      invalidFiles.push({
        file,
        error: result.error.issues[0].message,
      });
    }
  }

  return {
    validFiles,
    invalidFiles,
  };
}
