"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/card";

interface TreatmentNoteCardProps {
  title: string;
  content: string;
}

export function TreatmentNoteCard({ title, content }: TreatmentNoteCardProps) {
  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700">{content}</CardContent>
    </Card>
  );
}
