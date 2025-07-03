"use client";

import { Button } from "@/components/atoms";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Patient } from "../types";

interface ProfileHeaderProps {
  patient: Patient;
}

export function ProfileHeader({ patient }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white p-5 pl-0">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" className="!p-0 !px-2 text-gray-900">
            <ArrowLeft className="size-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          {patient.id} | {patient.firstName} {patient.lastName}
        </h1>
      </div>

      {/* <div className="flex items-center gap-2">
        <Button size="icon" variant="secondary" className="h-9 w-9">
          <FileText className="h-4 w-4 text-icon" />
        </Button>
        <Button size="icon" variant="secondary" className="h-9 w-9">
          <Calendar className="h-4 w-4 text-icon" />
        </Button>
      </div> */}
    </div>
  );
}
