import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "http://34.204.48.222:5001/api";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
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

async function handleRequest(request: NextRequest, params: { path: string[] }, method: string) {
  try {
    const path = params.path.join("/");
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const fullUrl = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

    // Get the request body for non-GET requests
    let body;
    if (method !== "GET") {
      body = await request.text();
    }

    // Prepare headers //TODO: update this dynamically
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-gateway-request": "true",
      "x-user-id": "12345",
      "x-user-role": "admin",
      "x-user-permissions": '["admin"]',
    };

    // Copy relevant headers from the original request
    const headersToForward = ["authorization", "cookie", "user-agent"];
    headersToForward.forEach((headerName) => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    });

    // Make the API request
    const apiResponse = await fetch(fullUrl, {
      method,
      headers,
      body: body || undefined,
    });

    const responseText = await apiResponse.text();

    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json(responseData, {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
