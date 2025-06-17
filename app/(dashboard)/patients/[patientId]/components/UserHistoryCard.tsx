"use client";

import { History } from "lucide-react";
import { UserHistory } from "../types";

interface UserHistoryCardProps {
  history: UserHistory;
}

export function UserHistoryCard({ history }: UserHistoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-brand-violet" />
        <h2 className="text-lg font-semibold">User History</h2>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500">Last Visited On</p>
          <p className="font-medium">{formatDate(history.lastVisited)}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500">Last Connected on Email</p>
          <p className="font-medium">{formatDate(history.lastEmailConnected)}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500">Last Connected on SMS</p>
          <p className="font-medium">{formatDate(history.lastSMSConnected)}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500">Created On</p>
          <p className="font-medium">{formatDate(history.createdOn)}</p>
        </div>
      </div>
    </div>
  );
}
