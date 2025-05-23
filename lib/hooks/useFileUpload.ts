import { UploadedFile, addFile, removeFile, updateFileUrl } from "@/lib/store/fileUploadsSlice";
// lib/hooks/useFileUpload.ts
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

export function useFileUpload() {
  const dispatch = useDispatch();

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      const id = uuid();
      const kind = file.type.startsWith("image/") ? "image" : "file";

      // optimistic placeholder
      dispatch(addFile({ id, name: file.name, type: kind, url: "__uploading__" }));

      const form = new FormData();
      form.append("file", file);

      try {
        const res = await fetch("/api/file-upload", {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error(await res.text());
        const { url } = (await res.json()) as { url: string };

        dispatch(updateFileUrl({ id, url }));
        return { id, name: file.name, type: kind, url };
      } catch (err) {
        console.error("[useFileUpload] upload failed:", err);
        dispatch(removeFile(id));
        throw err;
      }
    },
    [dispatch],
  );

  return { uploadFile };
}
