import { Button } from "@/components/atoms";
import { Calendar, Popover, PopoverContent, PopoverTrigger } from "@/components/molecules";
import { cn } from "@/lib/utils";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  getDaysInMonth,
  getMonth,
  getYear,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CalendarHeaderProps {
  date: Date;
  view: "day" | "week" | "month";
  onPrevious: () => void;
  onNext: () => void;
  onDateChange: (date: Date) => void;
  onViewChange: (view: "day" | "week" | "month") => void;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  onNewAppointment?: () => void;
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
  onNewAppointment,
}: CalendarHeaderProps) {
  // State to store visible days
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);

  // Generate the days to display
  useEffect(() => {
    // Generate days centered around the selected date
    const days: Date[] = [];
    const daysToShow = 7; // Total days to show
    const daysBeforeSelected = Math.floor(daysToShow / 2); // Days before the selected date

    for (let i = -daysBeforeSelected; i <= daysBeforeSelected; i++) {
      days.push(addDays(date, i));
    }

    setVisibleDays(days);
  }, [date]);

  // Get the current week dates for display
  const getWeekRange = (currentDate: Date) => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as start of week
    const end = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday as end of week

    // New algorithm to calculate week of month
    // We'll consider the first full week (containing at least 4 days of the month) as Week 1

    const currentMonth = getMonth(currentDate);
    const currentYear = getYear(currentDate);

    // Get first day of month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

    // Find the first Monday on or after the first day of the month
    // This will be the start of the first full week
    let firstMondayOfMonth = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    if (firstMondayOfMonth < firstDayOfMonth) {
      // If the first Monday is before the first day of the month,
      // we need to go to the next Monday
      firstMondayOfMonth = addDays(firstMondayOfMonth, 7);
    }

    // Calculate the week number by counting how many weeks between
    // the first Monday and our current week start
    const daysDifference = Math.floor(
      (start.getTime() - firstMondayOfMonth.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );

    // Add 1 to make it 1-indexed (Week 1, Week 2, etc.)
    const weekOfMonth = daysDifference + 1;

    return {
      start,
      end,
      weekOfMonth,
      formattedRange: `${format(start, "d")}-${format(end, "d")} ${format(start, "MMM yyyy")}`,
    };
  };

  // Get the month range for display
  const getMonthRange = (currentDate: Date) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);

    return {
      start: monthStart,
      end: monthEnd,
      formattedRange: `1 - ${daysInMonth} ${format(currentDate, "MMM")}`,
      year: format(currentDate, "yyyy"),
    };
  };

  const weekInfo = getWeekRange(date);
  const monthInfo = getMonthRange(date);

  // Handle previous navigation
  const handlePrevious = () => {
    let newDate: Date;
    // const newDate = subWeeks(date, 1);

    if (view === "week") {
      newDate = subWeeks(date, 1);
    } else if (view === "month") {
      newDate = subMonths(date, 1);
    } else {
      // Day view
      newDate = addDays(date, -1);
    }

    onDateChange(newDate);
    onPrevious();
  };

  // Handle next navigation
  const handleNext = () => {
    let newDate: Date;
    // const newDate = addWeeks(date, 1);
    if (view === "week") {
      newDate = addWeeks(date, 1);
    } else if (view === "month") {
      newDate = addMonths(date, 1);
    } else {
      // Day view
      newDate = addDays(date, 1);
    }

    onDateChange(newDate);
    onNext();
  };

  // Generate days of the week for header display
  const getDaysOfWeek = () => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }

    return days;
  };

  const daysOfWeek = getDaysOfWeek();

  // Check if a day is today
  const isToday = (day: Date) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  // Check if a day is the selected day
  const isSelected = (day: Date) => {
    return (
      day.getDate() === date.getDate() &&
      day.getMonth() === date.getMonth() &&
      day.getFullYear() === date.getFullYear()
    );
  };

  // Get the header title and subtitle based on the current view
  const getHeaderContent = () => {
    if (view === "day") {
      return {
        title: format(date, "d MMM yyyy"),
        subtitle: format(date, "EEEE"),
      };
    }

    if (view === "week") {
      return {
        title: weekInfo.formattedRange,
        subtitle: `Week ${weekInfo.weekOfMonth}`,
      };
    }

    // Month view
    return {
      title: monthInfo.formattedRange,
      subtitle: monthInfo.year,
    };
  };

  const headerContent = getHeaderContent();

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-between items-center relative">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone number"
              className="h-10 w-[293px] pl-10 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue-dark"
            />
          </div>

          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 px-3 justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-4 w-4" />
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
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-brand-blue-dark/10",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-brand-blue-dark/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-brand-blue-dark/10 rounded-md",
                  day_selected:
                    "bg-brand-blue-dark text-white hover:bg-brand-blue-dark/90 hover:text-white focus:bg-brand-blue-dark focus:text-white",
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

        {/* Date selector row - centered */}
        <div className="flex justify-center items-center mb-4.5">
          <div className="flex items-center gap-4 px-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="p-1 text-zinc-400 hover:text-zinc-900"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {view === "day" && (
              <div className="flex items-center gap-6">
                {visibleDays.map((day) => (
                  <button
                    key={`day-${format(day, "yyyy-MM-dd")}`}
                    type="button"
                    onClick={() => onDateChange(day)}
                    className={cn(
                      "flex flex-col items-center justify-center w-[50px] relative",
                      isSelected(day) &&
                        "z-10 bg-primary-subtle border border-primary-active px-1.5 py-1 rounded-xl",
                    )}
                  >
                    {/* {isSelected(day) && (
                    <div className="absolute inset-0 -z-10 h-[36px] w-[36px] rounded-xl bg-brand-blue-light border border-brand-blue-dark mx-auto my-auto" />
                  )} */}
                    {isToday(day) && !isSelected(day) && (
                      <div className="absolute inset-0 -z-10 h-[36px] w-[36px] rounded-xl bg-gray-100 mx-auto my-auto" />
                    )}
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        isSelected(day)
                          ? "text-brand-blue-dark bg-brand-blue/90"
                          : isToday(day)
                            ? "text-zinc-700"
                            : "text-zinc-900",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase",
                        isSelected(day)
                          ? "text-brand-blue-dark"
                          : isToday(day)
                            ? "text-zinc-700"
                            : "text-zinc-500",
                      )}
                    >
                      {format(day, "EEE")}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {view === "week" && (
              <div className="flex flex-col items-center justify-center relative">
                <span className="text-lg font-semibold">{weekInfo.formattedRange}</span>
                <span className="text-xs font-semibold uppercase text-zinc-500">
                  {headerContent.subtitle}
                </span>
              </div>
            )}
            {view === "month" && (
              <div className="flex flex-col items-center justify-center relative">
                <span className="text-lg font-semibold">{headerContent.title}</span>
                <span className="text-xs font-semibold uppercase text-zinc-500">
                  {headerContent.subtitle}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="p-1 text-zinc-400 hover:text-zinc-900"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4"
            onClick={() => onDateChange(new Date())}
          >
            Today
          </Button>

          <div className="w-[104px]">
            <select
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue-dark"
              value={view}
              onChange={(e) => onViewChange(e.target.value as "day" | "week" | "month")}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
