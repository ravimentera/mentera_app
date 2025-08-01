import pdfParse from "pdf-parse";

export interface PDFExtractionResult {
  success: boolean;
  text: string;
  metadata: {
    pages: number;
    title?: string;
    author?: string;
    wordCount: number;
  };
  error?: string;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  try {
    const data = await pdfParse(buffer);

    return {
      success: true,
      text: data.text,
      metadata: {
        pages: data.numpages,
        title: data.info?.Title,
        author: data.info?.Author,
        wordCount: data.text.split(/\s+/).length,
      },
    };
  } catch (pdfParseError) {
    console.log("pdf-parse failed, trying alternative method:", pdfParseError.message);

    try {
      // Fallback text extraction
      const bufferString = buffer.toString("binary");
      const textRegex = /BT\s*(.*?)\s*ET/gs;
      const matches = bufferString.match(textRegex);

      let extractedText = "";
      if (matches) {
        matches.forEach((match) => {
          const cleanText = match
            .replace(/BT|ET/g, "")
            .replace(/Tj|TJ|Tm|Td|TD/g, " ")
            .replace(/\([^)]*\)/g, (match) => {
              return match.slice(1, -1);
            })
            .replace(/[<>]/g, "")
            .replace(/\s+/g, " ")
            .trim();

          if (cleanText.length > 2) {
            extractedText += cleanText + " ";
          }
        });
      }

      const pageBreaks = (bufferString.match(/\/Type\s*\/Page/g) || []).length;
      const estimatedPages = Math.max(1, pageBreaks);

      if (extractedText.trim().length > 10) {
        return {
          success: true,
          text: extractedText.trim(),
          metadata: {
            pages: estimatedPages,
            wordCount: extractedText.trim().split(/\s+/).length,
          },
        };
      } else {
        throw new Error("No readable text found in PDF");
      }
    } catch (fallbackError) {
      return {
        success: false,
        text: "",
        metadata: { pages: 0, wordCount: 0 },
        error:
          "Could not extract text from PDF. The file may be image-based, encrypted, or corrupted.",
      };
    }
  }
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const maxSizeBytes = Number.parseInt(process.env.MAX_PDF_SIZE_MB || "10") * 1024 * 1024;

  if (file.type !== "application/pdf") {
    return { valid: false, error: "File must be a PDF" };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeBytes / 1024 / 1024}MB` };
  }

  return { valid: true };
}
