"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { Card, CardContent } from "../Card";

type Allergy = {
  name: string;
  reactions: string;
};

interface MedicalSummaryCardProps {
  allergies: Allergy[];
  onEditLink?: string;
}

export function MedicalSummaryCard({ allergies, onEditLink = "#" }: MedicalSummaryCardProps) {
  return (
    <Card className="w-full max-w-md border rounded-lg shadow-md">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardList className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-semibold text-gray-900">Medical Summary</h3>
          </div>
          <Link href={onEditLink} className="text-sm text-blue-600 hover:underline">
            Edit
          </Link>
        </div>

        {/* Allergy Items */}
        <div className="text-sm text-gray-700 space-y-4">
          {allergies.map((item) => (
            <div key={uuid()}>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-gray-600">Reaction : {item.reactions}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
