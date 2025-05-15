"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/card";

interface FallbackCardProps {
  title?: string;
  content: string;
}

export function FallbackCard({ title = "Details", content }: FallbackCardProps) {
  return (
    <Card className="bg-gray-50 w-full max-w-sm shadow-md border rounded-lg py-6 gap-6">
      <CardHeader>
        <CardTitle className="text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 whitespace-pre-wrap">{content}</CardContent>
    </Card>
  );
}
