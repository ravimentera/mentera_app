// Validate DrChrono setup according to API documentation
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🔍 Validating DrChrono setup");
  
  try {
    const body = await request.json();
    const { clientId, redirectUri } = body;

    const validation = {
      clientId: {
        valid: false,
        message: "",
        requirements: "Should be alphanumeric, ~40 characters long"
      },
      redirectUri: {
        valid: false,
        message: "", 
        requirements: "Must be exact match in DrChrono app settings"
      },
      overall: {
        valid: false,
        message: ""
      }
    };

    // Validate Client ID format
    if (!clientId) {
      validation.clientId.message = "Client ID is required";
    } else if (clientId.length < 30) {
      validation.clientId.message = "Client ID appears too short (should be ~40 chars)";
    } else if (!/^[a-zA-Z0-9]+$/.test(clientId)) {
      validation.clientId.message = "Client ID should be alphanumeric only";
    } else {
      validation.clientId.valid = true;
      validation.clientId.message = "✅ Client ID format looks correct";
    }

    // Validate Redirect URI format  
    if (!redirectUri) {
      validation.redirectUri.message = "Redirect URI is required";
    } else {
      try {
        const url = new URL(redirectUri);
        const isHttps = url.protocol === 'https:';
        const isLocalhost = url.hostname === 'localhost';
        const hasCorrectPath = url.pathname === '/api/integrations/drchrono/callback';

        if (!hasCorrectPath) {
          validation.redirectUri.message = "❌ Path should be '/api/integrations/drchrono/callback'";
        } else if (!isHttps && !isLocalhost) {
          validation.redirectUri.message = "⚠️ Should use HTTPS for production";
        } else {
          validation.redirectUri.valid = true;
          validation.redirectUri.message = "✅ Redirect URI format is correct";
        }
      } catch (e) {
        validation.redirectUri.message = "❌ Invalid URL format";
      }
    }

    // Overall validation
    if (validation.clientId.valid && validation.redirectUri.valid) {
      validation.overall.valid = true;
      validation.overall.message = "✅ Setup appears correct according to DrChrono API requirements";
    } else {
      validation.overall.message = "❌ Please fix the issues above before proceeding";
    }

    return NextResponse.json({
      success: true,
      validation,
      drchronoApiDocs: "https://app.drchrono.com/api-docs/#section/Authorization",
      nextSteps: validation.overall.valid ? [
        "1. Ensure redirect URI is added to your DrChrono app",
        "2. Test the OAuth flow", 
        "3. Verify token exchange works"
      ] : [
        "1. Fix validation errors above",
        "2. Double-check DrChrono API documentation",
        "3. Re-run validation"
      ]
    });

  } catch (error) {
    console.error("💥 Validation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 