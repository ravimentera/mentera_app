import { UploadedFile, addFile, removeFile, updateFileUrl } from "@/lib/store/fileUploadsSlice";
import {
  selectSelectedPatientId,
  selectTestMedSpa,
  selectTestNurse,
} from "@/lib/store/globalStateSlice";
// lib/hooks/useFileUpload.ts
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

export function useFileUpload() {
  const dispatch = useDispatch();
  const currentPatientId = useSelector(selectSelectedPatientId);
  const testMedSpa = useSelector(selectTestMedSpa);
  const testNurse = useSelector(selectTestNurse);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      const id = uuid();
      const kind = file.type.startsWith("image/") ? "image" : "file";

      // 1) Optimistic placeholder
      dispatch(addFile({ id, name: file.name, type: kind, url: "__uploading__" }));

      // 2) Guard against no patient selected
      if (!currentPatientId) {
        dispatch(removeFile(id));
        throw new Error("No patient selected. Please choose a patient before uploading.");
      }

      // 3) Build the FormData
      const form = new FormData();
      form.append("file", file);
      form.append("medSpaId", testMedSpa.medspaId);
      form.append("providerId", testNurse.id);
      form.append("patientId", currentPatientId); // now guaranteed a string

      try {
        // 4) Send to your S3-backed route
        const res = await fetch("/api/file-upload", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${res.status} ${text}`);
        }

        // 5) Parse once & update Redux
        const { url } = (await res.json()) as { url: string };
        dispatch(updateFileUrl({ id, url }));

        return { id, name: file.name, type: kind, url };
      } catch (err) {
        console.error("[useFileUpload] upload failed:", err);
        dispatch(removeFile(id));
        throw err;
      }
    },
    [dispatch, testMedSpa.medspaId, testNurse.id, currentPatientId],
  );

  return { uploadFile };
}
