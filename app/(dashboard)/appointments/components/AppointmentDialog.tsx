import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { Calendar } from "@/components/molecules/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/molecules/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/molecules/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules/tabs";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import { Calendar as CalendarIcon, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Appointment } from "./types";

interface TabValue {
  value: "edit" | "notify";
}

interface AppointmentDialogProps {
  mode: "new" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  dragStart?: number | null;
  dragEnd?: number | null;
  onSave?: (appointment: Partial<Appointment>) => void;
  onDelete?: (appointment: Appointment) => void;
  onApproveAndSend?: () => void;
  onDeclineAndRegenerate?: () => void;
  generateCareInstructions?: (appointment: Appointment) => { message: string; type: string };
  resetDragSelection?: () => void;
}

interface AppointmentForm {
  title: string;
  description: string;
  type: Appointment["type"];
  startTime: Date;
  endTime: Date;
}

export function AppointmentDialog({
  mode,
  open,
  onOpenChange,
  appointment,
  dragStart,
  dragEnd,
  onSave,
  onDelete,
  onApproveAndSend,
  onDeclineAndRegenerate,
  generateCareInstructions,
  resetDragSelection,
}: AppointmentDialogProps) {
  const [activeTab, setActiveTab] = useState<TabValue["value"]>("edit");
  const [formData, setFormData] = useState<AppointmentForm>({
    title: "",
    description: "",
    type: "general",
    startTime: new Date(),
    endTime: new Date(),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && mode === "new") {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  }, [open, mode]);

  useEffect(() => {
    if (mode === "edit" && appointment) {
      setFormData({
        title: appointment.patient.firstName,
        description: appointment.notes || "",
        type: appointment.type,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      });
    } else if (mode === "new" && dragStart && dragEnd) {
      const startTime = new Date(Math.min(dragStart, dragEnd));
      const endTime = new Date(Math.max(dragStart, dragEnd));
      setFormData({
        title: "",
        description: "",
        type: "general",
        startTime,
        endTime,
      });
    }
  }, [mode, appointment, dragStart, dragEnd]);

  const handleSave = () => {
    if (onSave) {
      if (mode === "new") {
        const newAppointment: Partial<Appointment> = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          startTime: formData.startTime,
          endTime: formData.endTime,
        };
        onSave(newAppointment);
      } else if (appointment) {
        const updatedAppointment: Partial<Appointment> = {
          ...appointment,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          startTime: formData.startTime,
          endTime: formData.endTime,
        };
        onSave(updatedAppointment);
      }
    }
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      title: "",
      description: "",
      type: "general",
      startTime: new Date(),
      endTime: new Date(),
    });
    setFormError(null);
    setEditedMessage("");
    if (mode === "new" && resetDragSelection) {
      resetDragSelection();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "New Appointment" : "Edit Appointment"}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue["value"])}
          defaultValue="edit"
          className="w-full"
        >
          <TabsList className="flex p-0 bg-[#FCFCFC]">
            <TabsTrigger
              value="edit"
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium border-b-2",
                activeTab === "edit"
                  ? "border-[#8A03D3] text-[#8A03D3]"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="notify"
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium border-b-2",
                activeTab === "notify"
                  ? "border-[#8A03D3] text-[#8A03D3]"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              Notify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal ring-offset-background focus-visible:ring-[#8A03D3] focus-visible:ring-offset-2",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#8A03D3]" />
                    {format(formData.startTime, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startTime}
                    onSelect={(newDate) => {
                      if (newDate) {
                        const newStartDateTime = set(newDate, {
                          hours: formData.startTime.getHours(),
                          minutes: formData.startTime.getMinutes(),
                        });
                        const newEndDateTime = set(newDate, {
                          hours: formData.endTime.getHours(),
                          minutes: formData.endTime.getMinutes(),
                        });
                        setFormData((prev) => ({
                          ...prev,
                          startTime: newStartDateTime,
                          endTime: newEndDateTime,
                        }));
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
                      day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_range_end: "day-range-end",
                      day_hidden: "invisible",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-time">Start Time</Label>
                <input
                  type="time"
                  id="edit-start-time"
                  step="900"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8A03D3] [&::-webkit-calendar-picker-indicator]:text-[#8A03D3] [&::-webkit-time-picker-indicator]:text-[#8A03D3]"
                  value={format(formData.startTime, "HH:mm")}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const newDateTime = set(formData.startTime, { hours, minutes });
                    setFormData((prev) => ({ ...prev, startTime: newDateTime }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-end-time">End Time</Label>
                <input
                  type="time"
                  id="edit-end-time"
                  step="900"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8A03D3] [&::-webkit-calendar-picker-indicator]:text-[#8A03D3] [&::-webkit-time-picker-indicator]:text-[#8A03D3]"
                  value={format(formData.endTime, "HH:mm")}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const newDateTime = set(formData.endTime, { hours, minutes });
                    setFormData((prev) => ({ ...prev, endTime: newDateTime }));
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter appointment title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter appointment description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Appointment Type</Label>
              <select
                id="edit-type"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as Appointment["type"],
                  }))
                }
              >
                <option value="general">General</option>
                <option value="therapy">Therapy</option>
                <option value="consultation">Consultation</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>

            {formError && <div className="text-sm text-red-500">{formError}</div>}
          </TabsContent>

          <TabsContent value="notify">
            {appointment && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Care Instructions</Label>
                  <Textarea
                    id="message"
                    value={
                      editedMessage ||
                      appointment.notificationStatus?.message ||
                      (generateCareInstructions && appointment
                        ? generateCareInstructions(appointment).message
                        : "")
                    }
                    onChange={(e) => setEditedMessage(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex justify-end items-center gap-4 mt-4">
                  {onApproveAndSend && (
                    <Button
                      onClick={onApproveAndSend}
                      className="flex items-center gap-2 text-green-700 bg-green-50 hover:bg-green-100"
                      disabled={isGeneratingMessage}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Approve & Send
                    </Button>
                  )}
                  {onDeclineAndRegenerate && (
                    <Button
                      onClick={onDeclineAndRegenerate}
                      className="flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100"
                      disabled={isGeneratingMessage}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Decline & Regenerate
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className={cn("flex gap-2", mode === "new" ? "ml-auto" : "")}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === "new" ? "Create Appointment" : "Update Appointment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
