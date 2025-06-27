import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

interface DrChronoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface DrChronoTokenError {
  error: string;
  error_description?: string;
}

interface OAuthState {
  organizationId: string;
  clientId?: string;
  clientSecret?: string;
  userId?: string;
  returnUrl?: string;
  timestamp: number;
}

// Removed OrganizationCredentials interface - no database needed

// Note: No database - credentials come from OAuth state (registration form)

// In-memory token storage for demo (replace with database in production)
const tokenStorage = new Map<string, {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}>();

async function storeTokens(orgId: string, tokens: DrChronoTokenResponse): Promise<void> {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  
  // Store in memory for demo (in production, use a database)
  tokenStorage.set(orgId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt,
    scope: tokens.scope,
  });

  console.log(`✅ Tokens stored for organization: ${orgId} (expires: ${expiresAt.toISOString()})`);
}

// Encryption helpers (use your preferred encryption method)
function encrypt(text: string): string {
  const algorithm = "aes-256-cbc";
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) throw new Error("ENCRYPTION_KEY not configured");

  // Create a proper 32-byte key from the secret
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText: string): string {
  const algorithm = "aes-256-cbc";
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) throw new Error("ENCRYPTION_KEY not configured");

  const [ivHex, encrypted] = encryptedText.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted data format");
  }

  // Create a proper 32-byte key from the secret
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function parseState(stateParam: string | string[] | undefined): OAuthState | null {
  if (!stateParam || typeof stateParam !== "string") return null;

  try {
    const decoded = JSON.parse(Buffer.from(stateParam, "base64").toString());

    // Validate state structure and timestamp (prevent replay attacks)
    if (!decoded.organizationId || !decoded.timestamp) return null;

    // Check if state is not older than 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    if (decoded.timestamp < tenMinutesAgo) return null;

    return decoded;
  } catch {
    return null;
  }
}

async function triggerKeragonWorkflow(orgId: string, accessToken: string) {
  console.log("🚀 Starting Keragon workflow trigger for org:", orgId);
  
  // Debug token info (first/last 4 chars for security)
  const tokenPreview = accessToken ? 
    `${accessToken.substring(0, 4)}...${accessToken.substring(accessToken.length - 4)}` : 
    "MISSING";
  console.log("🔑 Token preview:", tokenPreview, "Length:", accessToken?.length || 0);
  
  const payload = {
    inputs: {
      organizationId: orgId,
      drchronoAccessToken: accessToken,
      ehrType: "drchrono",
    },
  };
  
  console.log("📦 Payload structure:", {
    inputs: {
      organizationId: orgId,
      drchronoAccessToken: accessToken ? "***REDACTED***" : "MISSING",
      ehrType: "drchrono",
    },
  });
  
  console.log("📝 Full payload JSON length:", JSON.stringify(payload).length);
  
  console.log("🌐 Making request to Keragon...");
  const KERAGON_URL = "https://webhooks.us-1.keragon.com/v1/workflows/d9bdbdc1-31f9-4b6a-9f23-a32883891e7d/EYfPtmVpqSzvAFjpqh7Km/signal";
  
  const response = await fetch(KERAGON_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-medspa-id": orgId,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000) // 30 second timeout
  });
  
  console.log("📡 Keragon response status:", response.status);
  console.log("📡 Keragon response headers:", Object.fromEntries(response.headers.entries()));
  
  let result;
  try {
    const responseText = await response.text();
    console.log("📄 Raw Keragon response:", responseText);
    result = responseText ? JSON.parse(responseText) : {};
  } catch (parseError) {
    console.error("❌ Failed to parse Keragon response:", parseError);
    result = { error: "Failed to parse response" };
  }
  
  console.log("✅ Keragon workflow triggered:", result);
  return result;
}

export async function GET(request: NextRequest) {
  console.log("🔄 DrChrono callback endpoint hit");

  // Validate required environment variables
  if (!process.env.ENCRYPTION_KEY) {
    console.error("❌ ENCRYPTION_KEY environment variable not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const oauthError = searchParams.get("error");

  console.log("📋 Query params:", { code: code ? "present" : "missing", state: stateParam ? "present" : "missing", error: oauthError });

  // Handle OAuth errors
  if (oauthError) {
    console.error("❌ OAuth error:", oauthError);
    return NextResponse.redirect(
      new URL(`/register/steps/ehr-integration?error=oauth_failed&details=${encodeURIComponent(String(oauthError))}`, request.url)
    );
  }

  // Validate authorization code
  if (!code) {
    console.error("❌ Missing authorization code");
    return NextResponse.redirect(new URL("/register/steps/ehr-integration?error=missing_code", request.url));
  }

  // Parse and validate state parameter
  const state = parseState(stateParam || undefined);
  if (!state) {
    console.error("❌ Invalid or missing state parameter");
    return NextResponse.redirect(new URL("/register/steps/ehr-integration?error=invalid_state", request.url));
  }

  const { organizationId, returnUrl = "/dashboard" } = state;

  try {
    console.log(`🏢 Processing OAuth callback for organization: ${organizationId}`);

    let clientId: string;
    let clientSecret: string;

    // Credentials must come from OAuth state (registration form)
    if (!state.clientId || !state.clientSecret) {
      console.error("❌ Missing DrChrono credentials in OAuth state");
      return NextResponse.redirect(new URL(`${returnUrl}?error=missing_credentials`, request.url));
    }

    console.log("🔑 Using credentials from OAuth state (user-provided)");
    clientId = state.clientId;
    clientSecret = decrypt(state.clientSecret); // Decrypt the secret from state
    console.log(`🔑 Client ID from state: ${clientId}`);

    console.log(`✅ Using DrChrono credentials - Client ID: ${clientId}`);

    // Build redirect URI dynamically
    const requestUrl = new URL(request.url);
    const host = requestUrl.host;
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/integrations/drchrono/callback`;

    console.log("🔄 Exchanging authorization code for access token...");
    console.log("🌐 Redirect URI:", redirectUri);

    // Exchange authorization code for access token per DrChrono API docs
    const tokenResponse = await fetch("https://drchrono.com/o/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "User-Agent": "Mentera Integration/1.0"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    console.log("📡 Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData: DrChronoTokenError = await tokenResponse.json();
      console.error("❌ Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL(`${returnUrl}?error=token_exchange_failed&details=${encodeURIComponent(errorData.error)}`, request.url)
      );
    }

    const tokenData: DrChronoTokenResponse = await tokenResponse.json();

    console.log(`✅ Successfully obtained access token for organization: ${organizationId}`);
    console.log("🔍 Token data structure:", {
      access_token: tokenData.access_token ? `${tokenData.access_token.substring(0, 4)}...${tokenData.access_token.substring(tokenData.access_token.length - 4)}` : "MISSING",
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      refresh_token: tokenData.refresh_token ? "present" : "missing"
    });

    // Token security: Never log full tokens in production

    // Store tokens securely for this organization
    await storeTokens(organizationId, tokenData);
    
    // Trigger Keragon workflow with error handling
    try {
      console.log("🎯 About to trigger Keragon workflow...");
      await triggerKeragonWorkflow(organizationId, tokenData.access_token);
      console.log("✅ Keragon workflow trigger completed successfully");
    } catch (keragonError) {
      console.error("❌ Keragon workflow trigger failed:", keragonError);
      // Don't fail the whole flow - user still gets connected even if Keragon fails
    }

    // Redirect back to the application with success
    const successUrl = new URL("/register/success", request.url);
    successUrl.searchParams.set("connected", "true");
    successUrl.searchParams.set("provider", "drchrono");
    successUrl.searchParams.set("org", organizationId);

    console.log("🎉 Redirecting to success URL:", successUrl.toString());

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error(`💥 Unexpected error during token exchange for org ${organizationId}:`, error);

    const errorUrl = new URL(state.returnUrl || "/dashboard", request.url);
    errorUrl.searchParams.set("error", "connection_failed");
    errorUrl.searchParams.set("org", organizationId);

    return NextResponse.redirect(errorUrl);
  }
}

 