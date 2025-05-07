import { Button, Input } from "@/components/atoms";
import { useFormik } from "formik";

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const formik = useFormik({
    initialValues: { message: "" },
    onSubmit: ({ message }, { resetForm }) => {
      onSend(message);
      resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="border-t bg-white p-4">
      <div className="flex items-center gap-2">
        <Input
          id="message"
          name="message"
          placeholder="Type your message..."
          value={formik.values.message}
          onChange={formik.handleChange}
          className="flex-1 bg-gray-50 border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          required
        />
        <Button
          type="submit"
          disabled={!formik.values.message.trim()}
          className="rounded-lg px-5 py-2 shadow"
        >
          Send
        </Button>
      </div>
    </form>
  );
}
