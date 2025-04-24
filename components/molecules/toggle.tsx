import { useState } from "react";

export const Toggle = ({ label }: { label: string }) => {
  const [checked, setChecked] = useState(false);
  return (
    <label className="inline-flex items-center gap-1 cursor-pointer text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
        className="accent-blue-500 w-4 h-4"
      />
      {label}
    </label>
  );
};
