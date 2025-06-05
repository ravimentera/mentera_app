import { Button } from "@/components/atoms";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationControlsProps {
  currentIndex: number;
  totalApprovals: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export function NavigationControls({
  currentIndex,
  totalApprovals,
  onPrevious,
  onNext,
  className,
}: NavigationControlsProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center gap-4 mb-4">
        <span className="text-muted-foreground">{totalApprovals} records</span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={onNext}
            disabled={currentIndex === totalApprovals - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div />
      </div>
    </div>
  );
}
