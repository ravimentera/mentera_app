"use client";

import { Card, CardContent } from "../card";
// import { CalendarDays, Mail, MessageSquareText, UserPlus } from "lucide-react";

type UserHistory = {
  lastVisitedOn: string;
  lastConnectedEmail: string;
  lastConnectedSMS: string;
  createdOn: string;
};

interface UserHistoryCardProps {
  data: UserHistory;
  userInitial?: string;
}

export function UserHistoryCard({ data, userInitial = "R" }: UserHistoryCardProps) {
  return (
    <Card className="w-full max-w-sm shadow-md border rounded-lg">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-blue-600 text-white w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
            {userInitial}
          </div>
          <h3 className="text-sm font-medium text-gray-700">User History</h3>
        </div>
        <div className="text-sm space-y-2 text-gray-600">
          <Row label="Last Visited On" value={data.lastVisitedOn} />
          <Row label="Last Connected on Email" value={data.lastConnectedEmail} />
          <Row label="Last Connected on SMS" value={data.lastConnectedSMS} />
          <Row label="Created On" value={data.createdOn} />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
