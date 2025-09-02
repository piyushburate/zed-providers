"use server";

import { verifyProvider } from "@/lib/verifyProvider";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = params.get("provider");
  const url = params.get("url");

  if (!(provider && verifyProvider(provider))) {
    return NextResponse.json(
      { error: "Invalid Provider" },
      { status: 400 }
    );
  }
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const { getEpisodes } = await import(`@/providers/${provider}/episodes`);

    const episodes = await getEpisodes({ url });

    return NextResponse.json(
      { data: episodes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/get-episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}
