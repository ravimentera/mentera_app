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

interface OrganizationCredentials {
  id: string;
  clientId: string;
  clientSecret: string;
  name: string;
  isActive: boolean;
}

// Mock database functions - replace with your actual database calls
async function getOrganizationCredentials(orgId: string): Promise<OrganizationCredentials | null> {
  // TODO: Replace with actual database query
  // Example: SELECT client_id, client_secret FROM organizations WHERE id = ?

  // For now, returning mock data for testing - replace this with your DB call
  const query = `
    SELECT id, drchrono_client_id, drchrono_client_secret, name, is_active 
    FROM organizations 
    WHERE id = ? AND drchrono_client_id IS NOT NULL
  `;

  // Your database call here:
  // const org = await db.query(query, [orgId]);
  // return org ? {
  //   id: org.id,
  //   clientId: org.drchrono_client_id,
  //   clientSecret: decrypt(org.drchrono_client_secret), // Decrypt stored secret
  //   name: org.name,
  //   isActive: org.is_active
  // } : null;

  // Temporary mock data for testing
  return {
    id: orgId,
    clientId: "uUOjU7TwLqxq2bTrP332jhrq4nWDm5ZJfgG2c0FC",
    clientSecret:
      "o9jSstCH5QcoG1WClmB0KTEzvRuCLgwpv5CVwk94OmNQb0GfBSjDn9K2d02anPcbnSAU8EIFSFaLvKOMWPqfrply1oXFXHq0oRHVhHygEKCUkxmUHjpzle9fLiEWdPGe",
    name: "Test Organization",
    isActive: true,
  };
}

async function storeTokens(orgId: string, tokens: DrChronoTokenResponse): Promise<void> {
  // TODO: Store encrypted tokens in database
  const encryptedAccessToken = encrypt(tokens.access_token);
  const encryptedRefreshToken = encrypt(tokens.refresh_token);
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  // Example database call:
  // await db.query(`
  //   INSERT INTO drchrono_connections (organization_id, access_token, refresh_token, expires_at, scope, created_at)
  //   VALUES (?, ?, ?, ?, ?, NOW())
  //   ON DUPLICATE KEY UPDATE
  //   access_token = VALUES(access_token),
  //   refresh_token = VALUES(refresh_token),
  //   expires_at = VALUES(expires_at),
  //   scope = VALUES(scope),
  //   updated_at = NOW()
  // `, [orgId, encryptedAccessToken, encryptedRefreshToken, expiresAt, tokens.scope]);

  console.log(`Tokens stored for organization: ${orgId}`);
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
  
  const response = await fetch("https://webhooks.us-1.keragon.com/v1/workflows/d9bdbdc1-31f9-4b6a-9f23-a32883891e7d/EYfPtmVpqSzvAFjpqh7Km/signal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-medspa-id": orgId,
    },
    body: JSON.stringify(payload),
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
      new URL(`/dashboard?error=oauth_failed&details=${encodeURIComponent(String(oauthError))}`, request.url)
    );
  }

  // Validate authorization code
  if (!code) {
    console.error("❌ Missing authorization code");
    return NextResponse.redirect(new URL("/dashboard?error=missing_code", request.url));
  }

  // Parse and validate state parameter
  const state = parseState(stateParam || undefined);
  if (!state) {
    console.error("❌ Invalid or missing state parameter");
    return NextResponse.redirect(new URL("/dashboard?error=invalid_state", request.url));
  }

  const { organizationId, returnUrl = "/dashboard" } = state;

  try {
    console.log(`🏢 Processing OAuth callback for organization: ${organizationId}`);

    let clientId: string;
    let clientSecret: string;

    // Check if credentials are in the state (new flow) or need to be fetched (old flow)
    if (state.clientId && state.clientSecret) {
      console.log("🔑 Using credentials from OAuth state (user-provided)");
      clientId = state.clientId;
      clientSecret = decrypt(state.clientSecret); // Decrypt the secret from state
      console.log(`🔑 Client ID from state: ${clientId}`);
    } else {
      console.log("🔍 Fetching credentials from database (fallback to old flow)");
      // Fallback to database lookup for backward compatibility
      const orgCredentials = await getOrganizationCredentials(organizationId);
      if (!orgCredentials) {
        console.error(`❌ No DrChrono credentials found for organization: ${organizationId}`);
        return NextResponse.redirect(new URL(`${returnUrl}?error=org_not_configured`, request.url));
      }

      if (!orgCredentials.isActive) {
        console.error(`❌ Organization ${organizationId} is not active`);
        return NextResponse.redirect(new URL(`${returnUrl}?error=org_inactive`, request.url));
      }

      clientId = orgCredentials.clientId;
      clientSecret = orgCredentials.clientSecret;
    }

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

    // 🚨 DEBUG MODE - Remove this in production! 🚨
    // Temporarily log full token for testing purposes
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_TOKENS === 'true') {
      console.log("🚨 DEBUG: Full access token:", tokenData.access_token);
      console.log("🚨 WARNING: Full token logged above - remove in production!");
    }

    // Store tokens securely for this organization
    await storeTokens(organizationId, tokenData);
    await triggerKeragonWorkflow(organizationId, tokenData.access_token);

    // Redirect back to the application with success
    const successUrl = new URL(returnUrl, request.url);
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

// Helper function to create state parameter for OAuth initiation
export function createOAuthState(
  organizationId: string,
  userId?: string,
  returnUrl?: string,
): string {
  const state: OAuthState = {
    organizationId,
    userId,
    returnUrl,
    timestamp: Date.now(),
  };

  return Buffer.from(JSON.stringify(state)).toString("base64");
}

// Helper function to build OAuth authorization URL
export function buildOAuthUrl(
  organizationId: string,
  clientId?: string,
  userId?: string,
  returnUrl?: string,
  host?: string,
): string {
  const state = createOAuthState(organizationId, userId, returnUrl);
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host || "mentera-app.vercel.app"}/api/integrations/drchrono/callback`;

  // TODO: Remove hardcoded client ID once database integration is complete
  const testClientId = clientId || "uUOjU7TwLqxq2bTrP332jhrq4nWDm5ZJfgG2c0FC";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: testClientId,
    redirect_uri: redirectUri,
    scope: "patients:read patients:write clinical:read clinical:write",
    state: state,
  });

  return `https://drchrono.com/o/authorize/?${params.toString()}`;
} 