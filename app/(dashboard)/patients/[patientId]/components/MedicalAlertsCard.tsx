"use client";

import { Button } from "@/components/atoms";
import { AlertCircle } from "lucide-react";
import { MedicalAlert } from "../types";

interface MedicalAlertsCardProps {
  alerts: MedicalAlert[];
  onEdit: () => void;
}

export function MedicalAlertsCard({ alerts, onEdit }: MedicalAlertsCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#7C3AED]" />
          <h2 className="text-lg font-semibold">Medical Summary</h2>
        </div>
        <Button variant="link" onClick={onEdit} className="text-blue-600 font-medium">
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={`${alert.type}-${alert.description}`} className="space-y-1">
            <h3 className="font-medium">{alert.type}</h3>
            <p className="text-sm text-gray-500">Reaction : {alert.reaction}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
