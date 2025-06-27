// UI-friendly DrChrono integration endpoint
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Standard redirect URI that all users should use
const STANDARD_REDIRECT_URI = "https://mentera-app.vercel.app/api/integrations/drchrono/callback";
const LOCAL_REDIRECT_URI = "http://localhost:3000/api/integrations/drchrono/callback";

function encrypt(text: string): string {
  const algorithm = "aes-256-cbc";
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) throw new Error("ENCRYPTION_KEY not configured");

  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export async function POST(request: NextRequest) {
  console.log("🎨 UI-friendly DrChrono integration endpoint hit");
  
  try {
    const body = await request.json();
    const { action, organizationId, clientId, clientSecret } = body;

    // Step 1: Provide setup instructions
    if (action === "setup-instructions") {
      const requestUrl = new URL(request.url);
      const isLocal = requestUrl.host.includes("localhost");
      const redirectUri = isLocal ? LOCAL_REDIRECT_URI : STANDARD_REDIRECT_URI;

      return NextResponse.json({
        success: true,
        step: "setup_instructions",
        title: "DrChrono Integration Setup",
        message: "Follow these steps to connect your DrChrono account",
        instructions: [
          {
            step: 1,
            title: "Get Your DrChrono API Credentials",
            description: "Sign in to your DrChrono account and go to API Management",
            url: "https://app.drchrono.com/api-management/",
            action: "Visit DrChrono API Management"
          },
                     {
             step: 2,
             title: "Configure Redirect URI",
             description: `In your DrChrono application settings, add this exact redirect URI:`,
             code: redirectUri,
             note: "⚠️ Important: This must match exactly (including http/https and port). This is required per DrChrono's OAuth 2.0 specification."
           },
                     {
             step: 3,
             title: "Copy Your Credentials",
             description: "From your DrChrono application, copy the following:",
             fields: ["Client ID", "Client Secret"],
             note: "💡 Tip: Your Client ID should start with letters/numbers and be around 40 characters long"
           }
        ],
        nextAction: "connect",
        standardRedirectUri: redirectUri
      });
    }

    // Step 2: Connect with credentials
    if (action === "connect") {
      if (!organizationId || !clientId || !clientSecret) {
        return NextResponse.json({ 
          error: "Missing required fields: organizationId, clientId, clientSecret" 
        }, { status: 400 });
      }

      const requestUrl = new URL(request.url);
      const isLocal = requestUrl.host.includes("localhost");
      const redirectUri = isLocal ? LOCAL_REDIRECT_URI : STANDARD_REDIRECT_URI;

      console.log(`🏢 Connecting DrChrono for organization: ${organizationId}`);
      console.log(`🔑 Using client ID: ${clientId}`);
      console.log(`🌐 Using redirect URI: ${redirectUri}`);

      // Create encrypted state with user's credentials
      const state = {
        organizationId,
        clientId,
        clientSecret: encrypt(clientSecret),
        timestamp: Date.now(),
        returnUrl: "/register/success"
      };

      const stateParam = Buffer.from(JSON.stringify(state)).toString("base64");

             // DrChrono OAuth 2.0 parameters per API docs
       const oauthParams = new URLSearchParams({
         response_type: "code",
         client_id: clientId,
         redirect_uri: redirectUri,
         scope: "user:read patients:read patients:write clinical:read clinical:write practice:read",
         state: stateParam,
       });

      const oauthUrl = `https://drchrono.com/o/authorize/?${oauthParams.toString()}`;

      return NextResponse.json({
        success: true,
        step: "authorization",
        title: "Authorize Integration",
        message: "Click the button below to authorize Mentera to access your DrChrono data",
        oauthUrl,
        organizationId,
        buttonText: "Connect to DrChrono",
        instructions: "You'll be redirected to DrChrono to authorize the integration. After authorization, you'll be brought back and the integration will be complete.",
        expectedFlow: [
          "1. You'll see DrChrono's authorization page",
          "2. Click 'Allow' to authorize Mentera",
          "3. You'll be redirected back to your dashboard",
          "4. Integration will be automatically configured"
        ]
      });
    }

    // Step 3: Check integration status
    if (action === "status") {
      // TODO: Check if integration is already configured
      return NextResponse.json({
        success: true,
        step: "status_check",
        isConnected: false, // TODO: Check actual status
        lastSync: null,
        message: "Integration not yet configured"
      });
    }

    return NextResponse.json({ 
      error: "Invalid action. Use: setup-instructions, connect, or status" 
    }, { status: 400 });

  } catch (error) {
    console.error("💥 UI integration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 