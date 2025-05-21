type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

export const Toggle = ({ label, checked, onChange }: ToggleProps) => {
  return (
    <label className="inline-flex items-center gap-1 cursor-pointer text-gray-700 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-blue-500 w-4 h-4"
      />
      {label}
    </label>
  );
};
