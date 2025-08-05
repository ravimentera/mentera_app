import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const ragConfig = {
  documentLoaders: {
    "application/pdf": {
      loader: PDFLoader,
      textSplitter: {
        chunkSize: 1000,
        chunkOverlap: 200,
      },
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      loader: DocxLoader,
      textSplitter: {
        chunkSize: 1500,
        chunkOverlap: 300,
      },
    },
  },
  bedrockEmbeddings: {
    region: "us-east-1",
    model: "amazon.titan-embed-text-v2:0",
  },
};
