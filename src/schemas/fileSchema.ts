import { z } from "zod";

export const fileSchema = z
  .instanceof(File)
  .refine(
    (file) =>
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf"),
    {
      message: "Please select PDF files only.",
    },
  )
  .refine((file) => file.size <= 4 * 1024 * 1024, {
    message: "File size must be less than or equal to 4MB.",
  });
