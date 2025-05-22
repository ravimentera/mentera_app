"use client";

import { Bell, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { Card, CardContent } from "../Card";

type CampaignItem = {
  channel: "email" | "sms";
  title: string;
  label: string;
};

interface CampaignsCardProps {
  campaigns: CampaignItem[];
  onViewAllLink?: string;
}

export function CampaignsCard({ campaigns, onViewAllLink = "#" }: CampaignsCardProps) {
  return (
    <Card className="w-full max-w-md border rounded-lg shadow-md">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="text-yellow-600 w-5 h-5" />
            <h3 className="text-sm font-semibold text-gray-900">Campaigns</h3>
          </div>
          <Link href={onViewAllLink} className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {/* Campaign Items */}
        <div className="space-y-3 text-sm text-gray-700">
          {campaigns.map((c) => (
            <div key={uuid()} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {c.channel === "email" ? (
                  <Mail className="w-4 h-4 text-gray-500" />
                ) : (
                  <Smartphone className="w-4 h-4 text-gray-500" />
                )}
                <span className={c.channel === "email" ? "underline" : ""}>{c.title}</span>
              </div>
              <span className="text-gray-500">{c.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
