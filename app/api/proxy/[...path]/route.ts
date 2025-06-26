import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://34.204.48.222:5001/api";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "GET");
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "PUT");
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "DELETE");
}

async function handleRequest(request: NextRequest, path: string[], method: string) {
  try {
    // Reconstruct the path
    const pathSegments = path.join("/");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Construct the target URL
    const targetUrl = `${API_BASE_URL}/${pathSegments}${queryString ? `?${queryString}` : ""}`;

    console.log("Proxying request to:", targetUrl); // Add logging

    // Forward the request
    const response = await fetch(targetUrl, {
      method,
      headers: {
        ...Object.fromEntries(request.headers),
        // Remove headers that might cause issues
        host: new URL(API_BASE_URL).host,
      },
      ...(method !== "GET" && method !== "HEAD" && { body: request.body }),
    });

    // Forward the response
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
