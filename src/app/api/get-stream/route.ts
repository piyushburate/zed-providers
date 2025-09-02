"use server";

import { verifyProvider } from "@/lib/verifyProvider";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = params.get("provider");
  const link = params.get("link");
  const type = params.get("type");

  if (!(provider && verifyProvider(provider))) {
    return NextResponse.json(
      { error: "Invalid Provider" },
      { status: 400 }
    );
  }
  if (!link) {
    return NextResponse.json({ error: "Link is required" }, { status: 400 });
  }
  if (!type) {
    return NextResponse.json({ error: "Type is required" }, { status: 400 });
  }

  try {
    const { getStream } = await import(`@/providers/${provider}/stream`);

    const stream = await getStream({
      link,
      type: type,
      signal: request.signal,
    });

    return NextResponse.json({ data: stream }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/get-stream:", error);
    return NextResponse.json(
      { error: "Failed to fetch stream" },
      { status: 500 }
    );
  }
}
