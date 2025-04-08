import { NextResponse } from "next/server";

export async function GET() {
  // This is a placeholder response
  return NextResponse.json({
    users: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Here you would typically validate the input and save to a database
    return NextResponse.json({
      message: "User created successfully",
      user: body,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
