"use server";

import { verifyProvider } from "@/lib/verifyProvider";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = params.get("provider");
  const filter = params.get("filter");
  const page = params.get("page");

  if (!(provider && verifyProvider(provider))) {
    return NextResponse.json(
      { error: "Invalid Provider" },
      { status: 400 }
    );
  }

  try {
    const { getPosts } = await import(`@/providers/${provider}/posts`);

    const posts = await getPosts({
      filter: filter || "latest",
      page: page ? parseInt(page) : 1,
      providerValue: provider,
      signal: request.signal,
    });

    return NextResponse.json({ data: posts }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/get-posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
