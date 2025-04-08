import { generateMockUser } from "@/lib/mock-data";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users/[id]
 * Returns a single user by ID or a randomly generated user
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Use ID as seed for consistent results per ID
    const id = params.id;

    // If ID is 'random', don't pass a seed
    const seed = id === "random" ? undefined : Number.parseInt(id, 10) || 1;

    // Generate a mock user with the seed
    const user = generateMockUser(seed);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error generating user:", error);
    return NextResponse.json({ error: "Failed to generate user" }, { status: 500 });
  }
}
