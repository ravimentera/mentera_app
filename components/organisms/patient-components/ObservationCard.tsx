"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";

interface ObservationCardProps {
  notes: string;
}

export function ObservationCard({ notes }: ObservationCardProps) {
  return (
    <Card className="bg-sky-50 w-full max-w-sm shadow-md border rounded-lg py-6 gap-6">
      <CardHeader>
        <CardTitle>Patient Observations</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700">{notes}</CardContent>
    </Card>
  );
}
