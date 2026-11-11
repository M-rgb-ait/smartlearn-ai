import { getClientIp, isRateLimited } from "@/app/utils/rateLimit";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_PDF_BYTES = 4 * 1024 * 1024;
const MAX_TEXT_CHARS = 500_000;

const RATE_LIMIT = 20; // طلبات في الدقيقة (الرفع المتعدد بيعمل أكتر من طلب)

export async function POST(request: Request) {
  try {
    if (await isRateLimited("pdf", getClientIp(request), RATE_LIMIT)) {
      return Response.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    // فحص الحجم المعلن قبل قراءة الـ body (هامش بسيط لـ multipart overhead)
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_PDF_BYTES + 100_000) {
      return Response.json(
        { error: "PDF size must not exceed 4 MB" },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_PDF_BYTES) {
      return Response.json(
        { error: "PDF size must not exceed 4 MB" },
        { status: 413 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    // كل PDF حقيقي بيبدأ بـ %PDF-
    const header = new TextDecoder("latin1").decode(bytes.subarray(0, 5));
    if (header !== "%PDF-") {
      return Response.json({ error: "Invalid PDF file" }, { status: 400 });
    }

    const pdf = await getDocumentProxy(bytes);
    const result = await extractText(pdf, { mergePages: true });

    // نقص النص الطويل بدل ما نرفض الملف (الـ API التاني بيعمل sampling على أي حال)
    const extractedText = result.text.trim().slice(0, MAX_TEXT_CHARS);

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
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extractedText,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("PDF processing error:", error);

    return Response.json(
      { error: "Failed to process PDF. The file may be corrupted." },
      { status: 500 },
    );
  }
}
