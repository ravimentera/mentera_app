import { Construction } from "lucide-react";

export function TabPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
      <Construction className="h-12 w-12 mb-4 text-gray-400" />
      <p className="text-lg font-medium">Under Development</p>
      <p className="text-sm mt-1">This section is currently being built</p>
    </div>
  );
}
