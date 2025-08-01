import fs from "node:fs";
import path from "node:path";

interface StoredFile {
  fileId: string;
  fileName: string;
  threadId: string;
  chunks: Array<{
    id: string;
    content: string;
    metadata: {
      chunkIndex: number;
      startChar: number;
      endChar: number;
      wordCount: number;
    };
  }>;
  embeddings: number[][];
  uploadedAt: number;
  metadata: {
    pages: number;
    wordCount: number;
  };
}

export class FileStorage {
  private storageDir: string;

  constructor() {
    // Use a temporary directory for storage
    this.storageDir = path.join(process.cwd(), ".mentera-storage");
    this.ensureStorageDir();
  }

  private ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
      console.log("📁 Created storage directory:", this.storageDir);
    }
  }

  private getFilePath(fileId: string): string {
    return path.join(this.storageDir, `${fileId}.json`);
  }

  async saveFile(fileData: StoredFile): Promise<void> {
    try {
      const filePath = this.getFilePath(fileData.fileId);
      fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
      console.log("💾 Saved file data:", fileData.fileId);
    } catch (error) {
      console.error("❌ Error saving file:", error);
      throw error;
    }
  }

  async loadFile(fileId: string): Promise<StoredFile | null> {
    try {
      const filePath = this.getFilePath(fileId);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("❌ Error loading file:", fileId, error);
      return null;
    }
  }

  async getAllFileIds(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.storageDir)) {
        return [];
      }

      const files = fs.readdirSync(this.storageDir);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""));
    } catch (error) {
      console.error("❌ Error getting file IDs:", error);
      return [];
    }
  }

  async loadFiles(fileIds: string[]): Promise<StoredFile[]> {
    const files: StoredFile[] = [];
    for (const fileId of fileIds) {
      const file = await this.loadFile(fileId);
      if (file) {
        files.push(file);
      }
    }
    return files;
  }

  async getAllFiles(): Promise<StoredFile[]> {
    const fileIds = await this.getAllFileIds();
    const files: StoredFile[] = [];

    for (const fileId of fileIds) {
      const file = await this.loadFile(fileId);
      if (file) {
        files.push(file);
      }
    }

    return files;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(fileId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑️ Deleted file:", fileId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error deleting file:", fileId, error);
      return false;
    }
  }

  async getFilesByThreadId(threadId: string): Promise<StoredFile[]> {
    const allFiles = await this.getAllFiles();
    return allFiles.filter((file) => file.threadId === threadId);
  }
}

export const fileStorage = new FileStorage();
