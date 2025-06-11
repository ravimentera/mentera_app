// pages/api/drchrono/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

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
    clientId: 'uUOjU7TwLqxq2bTrP332jhrq4nWDm5ZJfgG2c0FC',
    clientSecret: 'o9jSstCH5QcoG1WClmB0KTEzvRuCLgwpv5CVwk94OmNQb0GfBSjDn9K2d02anPcbnSAU8EIFSFaLvKOMWPqfrply1oXFXHq0oRHVhHygEKCUkxmUHjpzle9fLiEWdPGe',
    name: 'Test Organization',
    isActive: true
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
  const algorithm = 'aes-256-cbc';
  const secretKey = process.env.ENCRYPTION_KEY; // 32-byte key
  if (!secretKey) throw new Error('ENCRYPTION_KEY not configured');
  
  const iv = crypto.randomBytes(16); // 16 bytes for CBC
  const cipher = crypto.createCipher(algorithm, secretKey);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const algorithm = 'aes-256-cbc';
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) throw new Error('ENCRYPTION_KEY not configured');
  
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher(algorithm, secretKey);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

function parseState(stateParam: string | string[] | undefined): OAuthState | null {
  if (!stateParam || typeof stateParam !== 'string') return null;
  
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString());
    
    // Validate state structure and timestamp (prevent replay attacks)
    if (!decoded.organizationId || !decoded.timestamp) return null;
    
    // Check if state is not older than 10 minutes
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (decoded.timestamp < tenMinutesAgo) return null;
    
    return decoded;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DrChronoTokenResponse | ErrorResponse>
) {
  // Validate required environment variables
  if (!process.env.ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY environment variable not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state: stateParam, error: oauthError } = req.query;

  // Handle OAuth errors
  if (oauthError) {
    console.error('OAuth error:', oauthError);
    return res.redirect(`/dashboard?error=oauth_failed&details=${encodeURIComponent(String(oauthError))}`);
  }

  // Validate authorization code
  if (!code || typeof code !== 'string') {
    return res.redirect('/dashboard?error=missing_code');
  }

  // Parse and validate state parameter
  const state = parseState(stateParam);
  if (!state) {
    console.error('Invalid or missing state parameter');
    return res.redirect('/dashboard?error=invalid_state');
  }

  const { organizationId, returnUrl = '/dashboard' } = state;

  try {
    console.log(`Processing OAuth callback for organization: ${organizationId}`);
    
    // Get organization-specific DrChrono credentials
    const orgCredentials = await getOrganizationCredentials(organizationId);
    if (!orgCredentials) {
      console.error(`No DrChrono credentials found for organization: ${organizationId}`);
      return res.redirect(`${returnUrl}?error=org_not_configured`);
    }

    if (!orgCredentials.isActive) {
      console.error(`Organization ${organizationId} is not active`);
      return res.redirect(`${returnUrl}?error=org_inactive`);
    }

    // TODO: Remove hardcoded credentials once database integration is complete
    // Using hardcoded credentials for testing
    const clientId = 'uUOjU7TwLqxq2bTrP332jhrq4nWDm5ZJfgG2c0FC';
    const clientSecret = 'o9jSstCH5QcoG1WClmB0KTEzvRuCLgwpv5CVwk94OmNQb0GfBSjDn9K2d02anPcbnSAU8EIFSFaLvKOMWPqfrply1oXFXHq0oRHVhHygEKCUkxmUHjpzle9fLiEWdPGe';

    // Build redirect URI dynamically
    const redirectUri = `${req.headers.host?.startsWith('localhost') ? 'http' : 'https'}://${req.headers.host}/api/integrations/drCronno-callback`;

    console.log('Exchanging authorization code for access token...');
    
    // Exchange authorization code for access token using org-specific credentials
    const tokenResponse = await fetch('https://drchrono.com/o/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData: DrChronoTokenError = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      return res.redirect(`${returnUrl}?error=token_exchange_failed&details=${encodeURIComponent(errorData.error)}`);
    }

    const tokenData: DrChronoTokenResponse = await tokenResponse.json();
    
    console.log(`Successfully obtained access token for organization: ${organizationId}`);

    // Store tokens securely for this organization
    await storeTokens(organizationId, tokenData);

    // Optional: Trigger Keragon workflow
    // await triggerKeragonWorkflow(organizationId, tokenData.access_token);

    // Redirect back to the application with success
    const successUrl = new URL(returnUrl, `https://${req.headers.host}`);
    successUrl.searchParams.set('connected', 'true');
    successUrl.searchParams.set('provider', 'drchrono');
    successUrl.searchParams.set('org', organizationId);
    
    res.redirect(302, successUrl.toString());

  } catch (error) {
    console.error(`Unexpected error during token exchange for org ${organizationId}:`, error);
    
    const errorUrl = new URL(state.returnUrl || '/dashboard', `https://${req.headers.host}`);
    errorUrl.searchParams.set('error', 'connection_failed');
    errorUrl.searchParams.set('org', organizationId);
    
    res.redirect(302, errorUrl.toString());
  }
}

// Helper function to create state parameter for OAuth initiation
export function createOAuthState(organizationId: string, userId?: string, returnUrl?: string): string {
  const state: OAuthState = {
    organizationId,
    userId,
    returnUrl,
    timestamp: Date.now(),
  };
  
  return Buffer.from(JSON.stringify(state)).toString('base64');
}

// Helper function to build OAuth authorization URL
export function buildOAuthUrl(organizationId: string, clientId?: string, userId?: string, returnUrl?: string, host?: string): string {
  const state = createOAuthState(organizationId, userId, returnUrl);
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host || 'mentera-app.vercel.app'}/api/integrations/drCronno-callback`;
  
  // TODO: Remove hardcoded client ID once database integration is complete
  const testClientId = clientId || 'uUOjU7TwLqxq2bTrP332jhrq4nWDm5ZJfgG2c0FC';
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: testClientId,
    redirect_uri: redirectUri,
    scope: 'patients:read patients:write clinical:read clinical:write',
    state: state,
  });
  
  return `https://drchrono.com/o/authorize/?${params.toString()}`;
}