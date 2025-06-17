"use client";

import { Button } from "@/components/atoms";
import { ChevronRight, FileText } from "lucide-react";
import { Document } from "../types";

interface DocumentsCardProps {
  documents: Document[];
  onViewAll: () => void;
}

export function DocumentsCard({ documents, onViewAll }: DocumentsCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-red" />
          <h2 className="text-lg font-semibold">Recent Documents</h2>
        </div>
        <Button variant="link" onClick={onViewAll} className="text-blue-600 font-medium">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{doc.title}</h3>
              <p className="text-sm text-gray-500">
                Signed on{" "}
                {new Date(doc.signedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
