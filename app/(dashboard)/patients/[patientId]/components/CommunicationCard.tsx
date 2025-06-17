"use client";

import { Switch } from "@/components/atoms";
import { Mail, MessageSquare } from "lucide-react";
import { CommunicationPreferences } from "../types";

interface CommunicationCardProps {
  preferences: CommunicationPreferences;
  onToggle: (key: keyof CommunicationPreferences, value: boolean) => void;
}

export function CommunicationCard({ preferences, onToggle }: CommunicationCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className=" flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-ui-icon-purple" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">Communication</h3>
          <button type="button" className="ml-auto text-sm font-medium text-blue-600">
            Edit
          </button>
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
