// lib/hooks/useFileUpload.ts
import { addFile, removeFile } from "@/lib/store/slices/fileUploadsSlice";
import { selectSelectedPatientId } from "@/lib/store/slices/globalStateSlice";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

/**
 * Only manages optimistic preview state.
 * Real upload happens inside `useWebSocketChat.sendMessage`.
 */
export function useFileUpload() {
  const dispatch = useDispatch();
  const patientId = useSelector(selectSelectedPatientId);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!patientId) throw new Error("Select a patient first.");

      const id = uuid();
      const kind = file.type.startsWith("image/") ? "image" : "file";
      const url = URL.createObjectURL(file);

      dispatch(addFile({ id, name: file.name, type: kind, file, previewUrl: url }));
      return { id, name: file.name, type: kind, file, previewUrl: url };
    },
    [dispatch, patientId],
  );

  const cancelFile = useCallback(
    (id: string) => {
      dispatch(removeFile(id));
    },
    [dispatch],
  );

  return { uploadFile, cancelFile };
}
