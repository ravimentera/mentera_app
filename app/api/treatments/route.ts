import { generateTreatmentPreferences } from "@/lib/mock-data";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/treatments
 * Returns treatment preference data for charts
 */
export async function GET(request: NextRequest) {
  try {
    // Generate treatment preferences data
    const treatments = generateTreatmentPreferences();

    return NextResponse.json({
      treatments,
    });
  } catch (error) {
    console.error("Error generating treatment data:", error);
    return NextResponse.json({ error: "Failed to generate treatment data" }, { status: 500 });
  }
}
