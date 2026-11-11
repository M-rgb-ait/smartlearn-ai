import { z } from "zod";

export const generatedQuestionSchema = z
  .object({
    question: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).min(2),
    correctAnswer: z.number().int().nonnegative(),
    explanation: z.string().optional(),
  })
  .refine((data) => data.correctAnswer < data.options.length, {
    message: "Correct answer index is out of range",
    path: ["correctAnswer"],
  });

export const questionsSchema = z.array(generatedQuestionSchema);

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

export const savedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  hash: z.string().optional(),
});

export const storedQuestionSchema = generatedQuestionSchema.and(
  z.object({ fileId: z.string().optional() }),
);

// قراءة آمنة من localStorage: بتتجاهل أي عنصر مش مطابق للـ schema
export function readStoredList<T>(key: string, schema: z.ZodType<T>): T[] {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
      const result = schema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}
