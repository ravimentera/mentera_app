"use client";

import { Button } from "@/components/atoms/Button";
import { Package2 } from "lucide-react";
import { Package } from "../types";

interface PackageCardProps {
  packages: Package[];
  onViewAll: () => void;
}

export function PackageCard({ packages, onViewAll }: PackageCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-[#C026D3]" />
          <h2 className="text-lg font-semibold">Active Packages (2/7)</h2>
        </div>
        <Button variant="link" onClick={onViewAll} className="text-blue-600 font-medium">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{pkg.name}</h3>
              <span className="text-base text-gray-500">
                {pkg.completedSessions}/{pkg.totalSessions} Sessions
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#BD05DD] to-[#111A53]"
                style={{ width: `${(pkg.completedSessions / pkg.totalSessions) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
