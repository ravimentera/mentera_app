import crypto from "node:crypto";
// Initiate DrChrono OAuth flow with user's credentials
import { NextRequest, NextResponse } from "next/server";

interface OAuthState {
  organizationId: string;
  clientId: string;
  clientSecret: string;
  timestamp: number;
  returnUrl?: string;
}

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
  console.log("🚀 Initiate DrChrono OAuth flow endpoint hit");

  try {
    const body = await request.json();
    const { organizationId, clientId, clientSecret, returnUrl } = body;

    if (!organizationId || !clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: "Missing required fields: organizationId, clientId, clientSecret",
        },
        { status: 400 },
      );
    }

    console.log(`🏢 Initiating OAuth for organization: ${organizationId}`);
    console.log(`🔑 Using client ID: ${clientId}`);

    // Create encrypted state with user's credentials
    const state: OAuthState = {
      organizationId,
      clientId,
      clientSecret: encrypt(clientSecret), // Encrypt the secret in state
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
      client_id: clientId, // Use the user's client ID
      redirect_uri: redirectUri,
      scope: "patients:read patients:write clinical:read clinical:write",
      state: stateParam,
    });

    const oauthUrl = `https://drchrono.com/o/authorize/?${oauthParams.toString()}`;

    console.log("🔗 Generated OAuth URL");
    console.log("🌐 Redirect URI:", redirectUri);

    return NextResponse.json({
      success: true,
      message: "OAuth flow initiated",
      oauthUrl,
      organizationId,
      redirectUri,
      instructions: "User should visit the oauthUrl to authorize the integration",
    });
  } catch (error) {
    console.error("💥 Error initiating OAuth flow:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
