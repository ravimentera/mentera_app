import { frontendRagConfig } from "@/config/frontend-rag.config";

export function getAcceptedFileTypes() {
  const mimeTypes = Object.keys(frontendRagConfig.supportedFileTypes);
  const extensions = Object.values(frontendRagConfig.supportedFileTypes);

  return {
    acceptString: mimeTypes.join(","),
    displayString: extensions.map((ext) => ext.toUpperCase().substring(1)).join(", "),
  };
}
