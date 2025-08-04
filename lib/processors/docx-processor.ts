/**
 * @file DOCX Processor
 * @module lib/processors/docx-processor
 * @description This module provides functions for extracting text from DOCX files and validating them.
 * It utilizes the 'mammoth' library for text extraction.
 * Future scope: Enhance error handling, support for more DOCX features (e.g., images, tables if needed).
 */

import mammoth from "mammoth";

export interface DocxExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

export async function extractTextFromDocx(buffer: Buffer): Promise<DocxExtractionResult> {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return { success: true, text: value };
  } catch (error) {
    return { success: false, text: "", error: "Could not extract text from DOCX file." };
  }
}

export function validateDocxFile(file: File): { valid: boolean; error?: string } {
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return { valid: false, error: "File must be a DOCX" };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeBytes / 1024 / 1024}MB` };
  }

  return { valid: true };
}
