import { Button } from "@/components/atoms";
import { Toggle } from "@/components/molecules";
import { patientDatabase } from "@/mock/chat.data";
import { Menu } from "lucide-react";

interface ChatTopbarProps {
  onOpenDrawer: () => void;
}

export function ChatTopbar(props: ChatTopbarProps) {
  const { onOpenDrawer } = props;

  return (
    <div className="px-4 py-2 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-4 text-sm">
      {/* hamburger – hidden on ≥ md (you can adjust) */}
      <Button
        variant="ghost"
        size="icon"
        // className="md:hidden"
        onClick={onOpenDrawer}
        aria-label="Open chat list"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}
