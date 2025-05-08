import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/molecules/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/molecules/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  date: Date;
  view: "day" | "week" | "month";
  onPrevious: () => void;
  onNext: () => void;
  onDateChange: (date: Date) => void;
  onViewChange: (view: "day" | "week" | "month") => void;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
}

export function CalendarHeader({
  date,
  view,
  onPrevious,
  onNext,
  onDateChange,
  onViewChange,
  isDatePickerOpen,
  setIsDatePickerOpen,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrevious} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM d, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  onDateChange(newDate);
                  setIsDatePickerOpen(false);
                }
              }}
              initialFocus
              className="rounded-md border shadow"
              classNames={{
                months: "space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#8A03D3]/10",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#8A03D3]/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#8A03D3]/10 rounded-md",
                day_selected:
                  "bg-[#8A03D3] text-white hover:bg-[#8A03D3]/90 hover:text-white focus:bg-[#8A03D3] focus:text-white",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                  "text-gray-500 opacity-50 aria-selected:bg-accent/50 aria-selected:text-gray-500 aria-selected:opacity-30",
                day_disabled: "text-gray-500 opacity-50 hover:bg-transparent",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_range_end: "day-range-end",
                day_hidden: "invisible",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex rounded-lg border p-1 gap-1">
        <Button
          variant={view === "day" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("day")}
        >
          Day
        </Button>
        <Button
          variant={view === "week" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("week")}
        >
          Week
        </Button>
        <Button
          variant={view === "month" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("month")}
        >
          Month
        </Button>
      </div>
    </div>
  );
}
