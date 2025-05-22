"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";

interface RecommendationCardProps {
  instructions: string;
}

export function RecommendationCard({ instructions }: RecommendationCardProps) {
  return (
    <Card className="bg-amber-50 w-full max-w-sm shadow-md border rounded-lg py-6 gap-6">
      <CardHeader>
        <CardTitle>Provider Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700">{instructions}</CardContent>
    </Card>
  );
}
