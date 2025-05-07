"use client";

import { Button } from "@/components";
import { LayoutRenderer } from "@/components/layout-renderer/LayoutRenderer";
import { useState } from "react";

export default function DynamicLayoutPage() {
  const [layout, setLayout] = useState(null);

  const handleFetch = async () => {
    const res = await fetch("/api/layout");
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
