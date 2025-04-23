import jwt from "jsonwebtoken";
// app/api/token/route.ts
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function GET() {
  const testToken = jwt.sign(
    {
      id: "NR-2001",
      email: "rachel.garcia@medspa.com",
      role: "PROVIDER",
      medspaId: "MS-1001",
    },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  return NextResponse.json({ token: testToken });
}
