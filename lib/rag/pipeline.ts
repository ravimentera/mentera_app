import { ragConfig } from "@/config/rag.config";
import { BedrockEmbeddings } from "@langchain/aws";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export class RAGPipelineService {
  private config = ragConfig;

  async processAndSearch(file: File, query: string) {
    const loaderConfig =
      this.config.documentLoaders[file.type as keyof typeof this.config.documentLoaders];
    if (!loaderConfig) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    const loader = new loaderConfig.loader(file);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter(loaderConfig.textSplitter);
    const splits = await textSplitter.splitDocuments(docs);

    const embeddings = new BedrockEmbeddings({
      ...this.config.bedrockEmbeddings,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings);
    const searchResults = await vectorStore.similaritySearch(query, 5);

    return searchResults;
  }
}
