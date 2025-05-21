"use client";

import { Button } from "@/components/atoms/Button";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { Patient } from "../types";

interface ProfileHeaderProps {
  patient: Patient;
}

export function ProfileHeader({ patient }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white border-b p-5">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" className="!p-0">
            <ArrowLeft className="size-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          {patient.id} | {patient.firstName} {patient.lastName}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9">
          <FileText className="h-4 w-4 text-gray-600" />
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Calendar className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}
