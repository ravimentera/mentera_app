"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { Card, CardContent } from "../Card";

export type DocumentItem = {
  title: string;
  signedOn: string;
};

interface RecentDocumentsCardProps {
  documents: DocumentItem[];
  onViewAllLink?: string;
}

export function RecentDocumentsCard({ documents, onViewAllLink = "#" }: RecentDocumentsCardProps) {
  return (
    <Card className="w-full max-w-md border rounded-lg shadow-md">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="text-red-600 w-5 h-5" />
            <h3 className="text-sm font-semibold text-gray-900 underline decoration-gray-900 underline-offset-2">
              Recent Documents
            </h3>
          </div>
          <Link href={onViewAllLink} className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={uuid()}>
              <div className="text-sm font-medium text-gray-900">{doc.title}</div>
              <div className="text-sm text-gray-600">Signed on {doc.signedOn}</div>
              {index < documents.length - 1 && <div className="border-t border-gray-200 mt-3" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
