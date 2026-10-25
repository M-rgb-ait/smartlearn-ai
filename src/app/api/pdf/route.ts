import { extractText, getDocumentProxy } from "unpdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return Response.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "PDF size must not exceed 10 MB" },
        { status: 413 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // استخراج النص من محتوى PDF
    const pdf = await getDocumentProxy(new Uint8Array(bytes));

    const result = await extractText(pdf, {
      mergePages: true,
    });

    const extractedText = result.text.trim();

    if (!extractedText) {
      return Response.json(
        {
          error: "No readable text found. This PDF may contain scanned pages.",
        },
        { status: 422 },
      );
    }

    return Response.json(
      {
        message: "PDF uploaded and text extracted successfully",
        originalName: file.name,
        // storedFileName,
        fileSize: file.size,
        extractedText,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("PDF processing error:", error);

    return Response.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
