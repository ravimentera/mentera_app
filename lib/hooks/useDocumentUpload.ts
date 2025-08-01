import { uploadDocumentFile } from "@/lib/api/files";
import { addDocumentFile, updateDocumentFileStatus } from "@/lib/store/slices/fileUploadsSlice";
import { getActiveThreadId } from "@/lib/store/slices/threadsSlice";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
  estimatedTimeRemaining?: number;
}

export function useDocumentUpload() {
  const dispatch = useDispatch();
  const activeThreadId = useSelector(getActiveThreadId);
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());

  const uploadDocument = useCallback(
    async (file: File): Promise<boolean> => {
      if (!activeThreadId) {
        console.error("No active thread ID");
        return false;
      }

      // Validate file size before starting
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSizeBytes) {
        console.error(`File too large: ${file.size} bytes (max: ${maxSizeBytes})`);
        return false;
      }

      const tempFileId = uuidv4();
      const startTime = Date.now();

      // Initialize progress tracking
      const updateProgress = (
        progress: number,
        status: UploadProgress["status"],
        estimatedTimeRemaining?: number,
      ) => {
        setUploads(
          (prev) =>
            new Map(
              prev.set(tempFileId, {
                fileId: tempFileId,
                progress,
                status,
                estimatedTimeRemaining,
              }),
            ),
        );
      };

      updateProgress(0, "uploading");

      // Add to Redux store with pending status
      dispatch(
        addDocumentFile({
          id: tempFileId,
          name: file.name,
          threadId: activeThreadId,
          chunkCount: 0,
          uploadedAt: Date.now(),
          status: "uploading",
        }),
      );

      try {
        // Simulate progressive upload tracking
        const progressInterval = setInterval(() => {
          setUploads((prev) => {
            const current = prev.get(tempFileId);
            if (current && current.progress < 50 && current.status === "uploading") {
              const newProgress = Math.min(current.progress + 10, 50);
              const elapsed = Date.now() - startTime;
              const estimatedTotal = elapsed / (newProgress / 100);
              const estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed);

              return new Map(
                prev.set(tempFileId, {
                  ...current,
                  progress: newProgress,
                  estimatedTimeRemaining,
                }),
              );
            }
            return prev;
          });
        }, 500);

        const result = await uploadDocumentFile(file, activeThreadId);

        clearInterval(progressInterval);

        if (result.success && result.fileId) {
          // Update to processing state
          updateProgress(60, "processing");

          // Simulate processing progress
          const processingInterval = setInterval(() => {
            setUploads((prev) => {
              const current = prev.get(tempFileId);
              if (current && current.progress < 90 && current.status === "processing") {
                return new Map(
                  prev.set(tempFileId, {
                    ...current,
                    progress: Math.min(current.progress + 15, 90),
                  }),
                );
              }
              return prev;
            });
          }, 300);

          // Wait for processing to complete
          setTimeout(() => {
            clearInterval(processingInterval);

            // Update Redux with successful upload
            dispatch(
              updateDocumentFileStatus({
                id: tempFileId,
                status: "processed",
                fileId: result.fileId,
                chunkCount: result.chunkCount || 0,
                metadata: result.metadata,
              }),
            );

            updateProgress(100, "completed");

            // Remove from progress tracking after delay
            setTimeout(() => {
              setUploads((prev) => {
                const newMap = new Map(prev);
                newMap.delete(tempFileId);
                return newMap;
              });
            }, 3000);
          }, 1000);

          return true;
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Update Redux with error
        dispatch(
          updateDocumentFileStatus({
            id: tempFileId,
            status: "error",
            error: errorMessage,
          }),
        );

        updateProgress(0, "error", 0);

        console.error("document upload failed:", error);
        return false;
      }
    },
    [activeThreadId, dispatch],
  );

  const getUploadProgress = useCallback(
    (fileId: string): UploadProgress | undefined => {
      return uploads.get(fileId);
    },
    [uploads],
  );

  const getAllUploads = useCallback((): UploadProgress[] => {
    return Array.from(uploads.values());
  }, [uploads]);

  const cancelUpload = useCallback((fileId: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  }, []);

  return {
    uploadDocument,
    getUploadProgress,
    getAllUploads,
    cancelUpload,
    isUploading: uploads.size > 0,
    activeUploads: uploads.size,
  };
}
