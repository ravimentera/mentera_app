"use client";

import clsx from "clsx";
import { Users2 } from "lucide-react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { Card, CardContent } from "../card";

type PackageProgress = {
  name: string;
  completedSessions: number;
  totalSessions: number;
  color?: "violet" | "rose";
};

interface ActivePackagesCardProps {
  totalActive: number;
  totalAvailable: number;
  packages: PackageProgress[];
  onViewAllLink?: string;
}

export function ActivePackagesCard({
  totalActive,
  totalAvailable,
  packages,
  onViewAllLink = "#",
}: ActivePackagesCardProps) {
  return (
    <Card className="w-full max-w-md border rounded-lg shadow-md">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users2 className="text-fuchsia-600 w-5 h-5" />
            <h3 className="text-sm font-semibold text-gray-900">
              Active Packages ({totalActive}/{totalAvailable})
            </h3>
          </div>
          <Link href={onViewAllLink} className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {/* Package Progress Bars */}
        <div className="space-y-4">
          {packages.map((pkg) => {
            const percent = (pkg.completedSessions / pkg.totalSessions) * 100;
            const color = pkg.color === "rose" ? "bg-rose-500/80" : "bg-violet-500"; // Default to violet

            const bgColor = pkg.color === "rose" ? "bg-rose-100" : "bg-violet-100"; // Track bg

            return (
              <div key={uuid()}>
                <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                  <span>{pkg.name}</span>
                  <span className="text-gray-500">
                    {pkg.completedSessions}/{pkg.totalSessions} Sessions
                  </span>
                </div>
                <div className={clsx("h-2 rounded-full", bgColor)} aria-hidden="true">
                  <div
                    className={clsx("h-full rounded-full", color)}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
