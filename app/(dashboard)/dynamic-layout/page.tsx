"use client";

import { Button } from "@/components/atoms/button";
import { LayoutRenderer } from "@/components/layout-renderer/LayoutRenderer";
import { useState } from "react";

export default function DynamicLayoutPage() {
  const [layout, setLayout] = useState(null);

  const markdown = `I have retrieved the patient's history from the search results.\n(2) I will extract the relevant information from the search results and format it according to the specified guidelines.\n(3) I will summarize the patient's treatment history, including the treatment received, follow-up plan, and any pre-procedure checks.\n(4) I will format the response according to the specified guidelines.\n\n**Patient Overview**\nInformation on patient PT-1004’s recent treatment and follow-up plan was requested.\n\n**Patient History**\n- Received HydraFacial treatment on the Full Face.\n- The treatment was performed by Megan Wilson and the outcome was Positive.\n- Their next follow-up is scheduled for 2025-04-05.\n\n**Actionable Insights**\n- The treatment notes for patient PT-1004 indicate:\n  - Procedure: HydraFacial\n  - Areas treated: Full Face\n  - Observations: Skin appeared visibly hydrated and glowing post-treatment. Patient noted improved texture and reduced fine lines. Recommended monthly sessions.\n  - Provider recommendations: Incorporate booster treatments for enhanced results, such as LED light therapy or lymphatic drainage.`;

  const handleFetch = async () => {
    const res = await fetch("/api/layout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markdown: markdown.trim(),
      }),
    });

    const data = await res.json();
    setLayout(data);
  };

  return (
    <main className="p-8 space-y-6">
      <Button onClick={handleFetch} className="bg-blue-600 text-white px-4 py-2 rounded">
        Fetch & Render Layout
      </Button>

      {layout ? (
        <LayoutRenderer layout={layout} />
      ) : (
        <p className="text-gray-500">Click the button to load layout</p>
      )}
    </main>
  );
}
