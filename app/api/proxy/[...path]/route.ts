import { NextRequest, NextResponse } from "next/server";

// Use environment variable for API base URL, with fallback
const API_BASE_URL = process.env.API_BASE_URL || "http://34.204.48.222:5001/api";
const REQUEST_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 2;

// Health check endpoint
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Special health check endpoint
  if (params.path.length === 1 && params.path[0] === "health") {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: "GET" }, 5000);
      return NextResponse.json(
        {
          status: "ok",
          backend: response.ok ? "connected" : "error",
          timestamp: new Date().toISOString(),
        },
        { status: response.ok ? 200 : 503 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          status: "error",
          backend: "unreachable",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }
  }

  return handleRequest(request, params, "GET");
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "DELETE");
}

// Helper function to create fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Helper function to retry failed requests
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number,
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, REQUEST_TIMEOUT);
    } catch (error: any) {
      console.log(`Attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * 2 ** attempt, 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw new Error("Max retries exceeded");
}

async function handleRequest(request: NextRequest, params: { path: string[] }, method: string) {
  try {
    const path = params.path.join("/");
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const fullUrl = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

    console.log(`[Proxy] ${method} ${fullUrl}`);

    // Get the request body for non-GET requests
    let body;
    if (method !== "GET") {
      body = await request.text();
      console.log(`[Proxy] Request body length: ${body?.length || 0} characters`);
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-gateway-request": "true",
      "x-user-id": "12345",
      "x-user-role": "admin",
      "x-user-permissions": '["admin"]',
      Accept: "application/json",
    };

    // Copy relevant headers from the original request
    const headersToForward = [
      "authorization",
      "cookie",
      "user-agent",
      "accept",
      "accept-encoding",
      "x-medspa-id",
    ];
    headersToForward.forEach((headerName) => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    });

    // Make the API request with retry logic
    const apiResponse = await fetchWithRetry(
      fullUrl,
      {
        method,
        headers,
        body: body || undefined,
      },
      MAX_RETRIES,
    );

    console.log(`[Proxy] Response status: ${apiResponse.status}`);

    // Handle different response types
    const contentType = apiResponse.headers.get("content-type");
    let responseData;

    if (contentType?.includes("application/json")) {
      responseData = await apiResponse.json();
    } else {
      responseData = await apiResponse.text();
    }

    return NextResponse.json(responseData, {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    console.error("Proxy error:", error);

    // Provide more specific error messages
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error.name === "AbortError") {
      errorMessage = "Request timeout - backend server took too long to respond";
      statusCode = 504;
    } else if (error.message?.includes("fetch failed") || error.code === "UND_ERR_SOCKET") {
      errorMessage = "Backend server is unreachable or connection was refused";
      statusCode = 503;
    } else if (error.message?.includes("ECONNREFUSED")) {
      errorMessage = "Backend server connection refused";
      statusCode = 503;
    } else if (error.message?.includes("ENOTFOUND")) {
      errorMessage = "Backend server not found";
      statusCode = 502;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        timestamp: new Date().toISOString(),
        endpoint: `${API_BASE_URL}/${params.path.join("/")}`,
      },
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-gateway-request, x-user-id, x-user-role, x-user-permissions, x-medspa-id",
    },
  });
}
