"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/card";

interface ActionableInsightsCardProps {
  procedure: string;
  areasTreated: string;
  observations: string;
}

export function ActionableInsightsCard({
  procedure,
  areasTreated,
  observations,
}: ActionableInsightsCardProps) {
  return (
    <Card className="bg-blue-50 w-full max-w-sm shadow-md border rounded-lg py-6 gap-6">
      <CardHeader>
        <CardTitle className="text-blue-900">Actionable Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-800 leading-relaxed">
        <div>
          <strong>Procedure:</strong> {procedure}
        </div>
        <div>
          <strong>Areas Treated:</strong> {areasTreated}
        </div>
        <div>
          <strong>Observations:</strong> {observations}
        </div>
      </CardContent>
    </Card>
  );
}
