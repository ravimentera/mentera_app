"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/card";

interface ProcedureCardProps {
  procedure: string;
  areasTreated?: string;
}

export function ProcedureCard({ procedure, areasTreated }: ProcedureCardProps) {
  return (
    <Card className="bg-violet-50">
      <CardHeader>
        <CardTitle>Procedure Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-gray-700">
        <div>
          <strong>Procedure:</strong> {procedure}
        </div>
        {areasTreated && (
          <div>
            <strong>Areas Treated:</strong> {areasTreated}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
