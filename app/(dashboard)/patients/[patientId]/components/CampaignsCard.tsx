"use client";

import { Button } from "@/components/atoms/button";
import { ChevronRight, Mail, MessageSquare } from "lucide-react";
import { Campaign } from "../types";

interface CampaignsCardProps {
  campaigns: Campaign[];
  onViewAll: () => void;
}

export function CampaignsCard({ campaigns, onViewAll }: CampaignsCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#CA8A04]" />
          <h2 className="text-lg font-semibold">Campaigns</h2>
        </div>
        <Button variant="link" onClick={onViewAll} className="text-blue-600 font-medium">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {campaign.type === "email" ? (
                <Mail className="h-4 w-4 text-gray-500" />
              ) : (
                <MessageSquare className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm text-gray-600">{campaign.name}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
