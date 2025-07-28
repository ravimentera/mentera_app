import jwt from "jsonwebtoken";
// app/api/token/route.ts
import { NextRequest, NextResponse } from "next/server";

// Ideally move these into your .env.local
const JWT_SECRET = process.env.JWT_SECRET || "mentera-production-jwt-secret-2025";
const JWT_ISSUER = process.env.JWT_ISSUER || "mentera-auth-service";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "mentera-api";
const MEDSPA_ID = process.env.MEDSPA_ID || "MS-1001";

export async function GET(_req: NextRequest) {
  // Build your JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "test-user",
    id: "PR-2001",
    email: "admin@mentera.ai",
    medspaId: MEDSPA_ID,
    providerId: "PR-2001",
    role: "physician",
    permissions: [
      "VIEW_PATIENTS",
      "EDIT_PATIENTS",
      "CREATE_PATIENT",
      "DELETE_PATIENT",
      "view:providers",
      "admin",
      "system",
    ],
    iat: now,
  };

  // Sign it
  const token = jwt.sign(payload, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: "1Day",
  });

  // Return as JSON
  return NextResponse.json({ token: `Bearer ${token}` });
}
