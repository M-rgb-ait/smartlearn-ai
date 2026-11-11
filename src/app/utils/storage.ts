import {
  readStoredList,
  savedFileSchema,
  storedQuestionSchema,
} from "@/schemas/question.schema";

export function writeStorage<T>(key: string, value: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getSavedFiles() {
  return readStoredList("files", savedFileSchema);
}

export function getSavedQuestions() {
  return readStoredList("questions", storedQuestionSchema);
}
