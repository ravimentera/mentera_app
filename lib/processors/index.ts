import { DocxExtractionResult, extractTextFromDocx, validateDocxFile } from "./docx-processor";
import { PDFExtractionResult, extractTextFromPDF, validatePDFFile } from "./pdf-processor";

export async function processFile(
  file: File,
): Promise<{ success: boolean; text?: string; pages?: number; error?: string }> {
  if (file.type === "application/pdf") {
    const { valid, error } = validatePDFFile(file);
    if (!valid) {
      return { success: false, error };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result: PDFExtractionResult = await extractTextFromPDF(buffer);
    if (result.success) {
      return {
        success: true,
        text: result.text,
        pages: result.metadata.pages,
      };
    } else {
      return { success: false, error: result.error };
    }
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { valid, error } = validateDocxFile(file);
    if (!valid) {
      return { success: false, error };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result: DocxExtractionResult = await extractTextFromDocx(buffer);
    if (result.success) {
      return { success: true, text: result.text, pages: 1 }; // DOCX doesn't have a concept of pages in the same way as PDF, so default to 1
    } else {
      return { success: false, error: result.error };
    }
  } else {
    return { success: false, error: "Unsupported file type" };
  }
}
