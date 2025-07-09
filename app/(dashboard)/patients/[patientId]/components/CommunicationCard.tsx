"use client";

import { Switch } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare } from "lucide-react";
import { CommunicationPreferences } from "../types";

interface CommunicationCardProps {
  preferences: CommunicationPreferences;
  onToggle: (key: keyof CommunicationPreferences, value: boolean) => void;
  showBorder?: boolean;
}

export function CommunicationCard({
  preferences,
  onToggle,
  showBorder = true,
}: CommunicationCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg overflow-hidden",
        showBorder && "border border-border p-6",
      )}
    >
      <div className={cn("space-y-4", showBorder && "p-4")}>
        {/* Header */}
        <div className="flex items-center gap-2">
          {showBorder && (
            <div className=" flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-brand-blue" />
            </div>
          )}
          <h3 className="text-lg font-semibold">Communication</h3>
          {showBorder && (
            <button type="button" className="ml-auto text-sm font-medium text-blue-700">
              Edit
            </button>
          )}
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Email notifications</span>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => onToggle("emailNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">SMS reminders</span>
            </div>
            <Switch
              checked={preferences.smsReminders}
              onCheckedChange={(checked) => onToggle("smsReminders", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
