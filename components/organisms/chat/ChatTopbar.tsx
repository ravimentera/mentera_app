import { Button } from "@/components/atoms";
import { Toggle } from "@/components/molecules";
import { patientDatabase } from "@/mock/chat.data";
import { Menu } from "lucide-react";

interface ChatTopbarProps {
  onOpenDrawer: () => void;
  currentPatientId: keyof typeof patientDatabase;
  setCurrentPatientId: (id: keyof typeof patientDatabase) => void;
  isPatientContextEnabled: boolean;
  setIsPatientContextEnabled: (v: boolean) => void;
  forceFresh: boolean;
  setForceFresh: (v: boolean) => void;
  cacheDebug: boolean;
  setCacheDebug: (v: boolean) => void;
}

export function ChatTopbar(props: ChatTopbarProps) {
  const {
    onOpenDrawer,
    currentPatientId,
    setCurrentPatientId,
    isPatientContextEnabled,
    setIsPatientContextEnabled,
    forceFresh,
    setForceFresh,
    cacheDebug,
    setCacheDebug,
  } = props;

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
      <label className="font-medium">
        Patient:
        <select
          className="ml-2 border rounded px-2 py-1 bg-white text-black"
          value={currentPatientId}
          onChange={(e) => setCurrentPatientId(e.target.value as keyof typeof patientDatabase)}
        >
          {Object.keys(patientDatabase).map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3">
        <Toggle
          label="Patient Context"
          checked={isPatientContextEnabled}
          onChange={() => setIsPatientContextEnabled(!isPatientContextEnabled)}
        />
        <Toggle
          label="Force Fresh"
          checked={forceFresh}
          onChange={() => setForceFresh(!forceFresh)}
        />
        <Toggle
          label="Cache Debug"
          checked={cacheDebug}
          onChange={() => setCacheDebug(!cacheDebug)}
        />
      </div>
    </div>
  );
}
