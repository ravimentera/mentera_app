import { Button, Input, Label, Textarea } from "@/components/atoms";
import {
  Calendar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/molecules";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import { Calendar as CalendarIcon, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Appointment } from "./types";

interface AppointmentDialogProps {
  mode: "new" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  dragStart?: number | null;
  dragEnd?: number | null;
  onSave: (appointment: Partial<Appointment>) => void;
  onDelete?: (appointment: Appointment) => void;
  onApproveAndSend?: (appointment: Appointment, editedMessage: string) => void;
  onDeclineAndRegenerate?: (appointment: Appointment) => void;
  generateCareInstructions?: (appointment: Appointment) => {
    message: string;
    type: "pre-care" | "post-care";
  };
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
  const [activeTab, setActiveTab] = useState(mode === "new" ? "edit" : "notify");
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
    // Validate title
    if (!formData.title.trim()) {
      setFormError("Title is required");
      return;
    }

    // Validate times
    if (formData.startTime >= formData.endTime) {
      setFormError("End time must be after start time");
      return;
    }

    // Clear error if validation passes
    setFormError(null);

    onSave({
      ...(appointment || {}),
      patient: {
        ...(appointment?.patient || { firstName: formData.title, lastName: "" }),
        firstName: formData.title,
      },
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.description,
      type: formData.type,
    });

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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "New Appointment" : "View Appointment"}</DialogTitle>
        </DialogHeader>

        {mode === "new" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-date">Date</Label>
              <div className="text-sm text-gray-500">
                {dragStart && format(new Date(dragStart), "MMMM d, yyyy")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-start-time">Start Time</Label>
                <input
                  type="time"
                  id="new-start-time"
                  step="900"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-purple-dark [&::-webkit-calendar-picker-indicator]:text-brand-purple-dark [&::-webkit-time-picker-indicator]:text-brand-purple-dark"
                  value={format(formData.startTime, "HH:mm")}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const newDateTime = set(formData.startTime, { hours, minutes });
                    setFormData((prev) => ({ ...prev, startTime: newDateTime }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-end-time">End Time</Label>
                <input
                  type="time"
                  id="new-end-time"
                  step="900"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-purple-dark [&::-webkit-calendar-picker-indicator]:text-brand-purple-dark [&::-webkit-time-picker-indicator]:text-brand-purple-dark"
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
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                ref={titleInputRef}
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter appointment title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter appointment description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <select
                id="type"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as Appointment["type"] }))
                }
              >
                <option value="general">General</option>
                <option value="therapy">Therapy</option>
                <option value="consultation">Consultation</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>

            {formError && <div className="text-sm text-red-500">{formError}</div>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Create Appointment</Button>
            </div>
          </div>
        ) : (
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex p-0 bg-ui-background-subtle">
              <TabsTrigger
                value="notify"
                className={`px-4 py-2.5 text-sm font-medium rounded-b-sm border-b-2 ${
                  activeTab === "notify"
                    ? "bg-ui-background-purple text-ui-icon-purple border-ui-icon-purple hover:bg-ui-background-purple hover:text-ui-icon-purple"
                    : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Notify
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className={`px-4 py-2.5 text-sm font-medium rounded-b-sm border-b-2 ${
                  activeTab === "edit"
                    ? "bg-ui-background-purple text-ui-icon-purple border-ui-icon-purple hover:bg-ui-background-purple hover:text-ui-icon-purple"
                    : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Edit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notify" className="space-y-4 py-4">
              {appointment && (
                <div className="space-y-4">
                  <div className="relative">
                    {/* Only show Tera Compose label for pending notifications */}
                    {appointment.notificationStatus?.status === "pending" && (
                      <div className="absolute -top-3 -right-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-ui-icon-purple text-white text-sm">
                        <Sparkles className="h-4 w-4" />
                        Tera Compose
                      </div>
                    )}

                    {appointment.notificationStatus?.status === "approved" ? (
                      <div className="space-y-3">
                        <div className="pt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 whitespace-pre-wrap">
                            {appointment.notificationStatus.editedMessage ||
                              appointment.notificationStatus.message}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-600">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {appointment.notificationStatus.type === "pre-care"
                            ? "Pre-care instructions have been sent to the patient"
                            : "Post-care instructions have been sent to the patient"}
                        </div>
                      </div>
                    ) : appointment.notificationStatus?.status === "disapproved" ? (
                      <div className="space-y-3">
                        <div className="pt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 whitespace-pre-wrap">
                            {appointment.notificationStatus.editedMessage ||
                              appointment.notificationStatus.message}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Care instructions were declined. Generate new instructions?
                        </div>
                      </div>
                    ) : (
                      <>
                        <Textarea
                          value={
                            editedMessage ||
                            appointment.notificationStatus?.message ||
                            generateCareInstructions?.(appointment)?.message
                          }
                          onChange={(e) => setEditedMessage(e.target.value)}
                          className="min-h-[180px] resize-none pt-6"
                          placeholder="Edit care instructions..."
                        />

                        <div className="flex justify-end items-center gap-4 mt-4">
                          <Button
                            onClick={() => onApproveAndSend?.(appointment, editedMessage)}
                            className="flex items-center gap-2 text-green-700 bg-green-50 hover:bg-green-100"
                            disabled={isGeneratingMessage}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Approve & Send
                          </Button>
                          <Button
                            onClick={() => onDeclineAndRegenerate?.(appointment)}
                            className="flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100"
                            disabled={isGeneratingMessage}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Decline & Regenerate
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal ring-offset-background focus-visible:ring-brand-purple-dark focus-visible:ring-offset-2",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-brand-purple-dark" />
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
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-brand-purple-dark/10",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell:
                          "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
                        row: "flex w-full mt-2",
                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-brand-purple-dark/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-brand-purple-dark/10 rounded-md",
                        day_selected:
                          "bg-brand-purple-dark text-white hover:bg-brand-purple-dark/90 hover:text-white focus:bg-brand-purple-dark focus:text-white",
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
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-purple-dark [&::-webkit-calendar-picker-indicator]:text-brand-purple-dark [&::-webkit-time-picker-indicator]:text-brand-purple-dark"
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
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-purple-dark [&::-webkit-calendar-picker-indicator]:text-brand-purple-dark [&::-webkit-time-picker-indicator]:text-brand-purple-dark"
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
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

              <div className="flex justify-between gap-2">
                {mode === "edit" && onDelete && appointment && (
                  <Button variant="destructive" onClick={() => onDelete(appointment)}>
                    Delete
                  </Button>
                )}
                <div
                  className={cn("flex gap-2", (mode as "new" | "edit") === "new" ? "ml-auto" : "")}
                >
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {(mode as "new" | "edit") === "new"
                      ? "Create Appointment"
                      : "Update Appointment"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
