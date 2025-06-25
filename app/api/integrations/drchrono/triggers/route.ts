import crypto from "node:crypto";
// app/api/integrations/drchrono/triggers/route.ts
import { NextRequest, NextResponse } from "next/server";

const KERAGON_TRIGGER_URL =
  "https://webhooks.us-1.keragon.com/v1/workflows/d9bdbdc1-31f9-4b6a-9f23-a32883891e7d/EYfPtmVpqSzvAFjpqh7Km/signal";

// Encryption helper
function encrypt(text: string): string {
  const algorithm = "aes-256-cbc";
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) throw new Error("ENCRYPTION_KEY not configured");

  // Create a proper 32-byte key from the secret
  const key = crypto.createHash("sha256").update(secretKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export async function POST(request: NextRequest) {
  console.log("🚀 DrChrono trigger endpoint hit - DEFAULT FLOW: OAuth + Token");

  try {
    const body = await request.json();
    console.log("📋 Request body:", body);

    const { organizationId, clientId, clientSecret, returnUrl } = body;

    if (!organizationId || !clientId || !clientSecret) {
      console.error("❌ Missing required fields for OAuth flow");
      return NextResponse.json(
        {
          error: "Missing required fields: organizationId, clientId, clientSecret",
        },
        { status: 400 },
      );
    }

    console.log(`🏢 Initiating OAuth flow for organization: ${organizationId}`);
    console.log(`🔑 Using client ID: ${clientId}`);

    // Create encrypted state with user's credentials
    const state = {
      organizationId,
      clientId,
      clientSecret: encrypt(clientSecret),
      timestamp: Date.now(),
      returnUrl: returnUrl || "/dashboard",
    };

    const stateParam = Buffer.from(JSON.stringify(state)).toString("base64");

    // Build OAuth URL with user's client ID
    const requestUrl = new URL(request.url);
    const host = requestUrl.host;
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/integrations/drchrono/callback`;

    const oauthParams = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "patients:read patients:write clinical:read clinical:write",
      state: stateParam,
    });

    const oauthUrl = `https://drchrono.com/o/authorize/?${oauthParams.toString()}`;

    console.log("🔗 Generated OAuth URL for token acquisition");
    console.log("🌐 Redirect URI:", redirectUri);

    return NextResponse.json({
      success: true,
      message: "OAuth flow initiated - user must authorize to get real token",
      flow: "oauth_required",
      oauthUrl,
      organizationId,
      instructions:
        "Visit the oauthUrl to authorize. After authorization, DrChrono will redirect back and automatically trigger Keragon with the real access token.",
    });
  } catch (error) {
    console.error("💥 Trigger error:", error);
    if (error instanceof Error) {
      console.error("💥 Error stack:", error.stack);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
