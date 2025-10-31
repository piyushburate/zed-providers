"use server";

import { getProvider } from "@/lib/getProvider";
import { GetSearchPostsParams, Post } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = getProvider(params.get("provider") || "");
  const page = params.get("page");
  const query = params.get("query");

  if (provider == null) {
    return NextResponse.json({ error: "Invalid Provider" }, { status: 400 });
  }
  if (!query) {
    return NextResponse.json(
      { error: "Query is required" },
      { status: 400 }
    );
  }

  try {
    const scrapper = provider.scrapper.posts || provider.scrapper.default;
    const {
      getSearchPosts,
    }: { getSearchPosts: (params: GetSearchPostsParams) => Promise<Post[]> } =
      await import(`@/scrappers/${scrapper}/posts`);

    const posts = await getSearchPosts({
      query: query,
      page: page ? parseInt(page) : 1,
      provider: provider,
      signal: request.signal,
    });

    return NextResponse.json({ data: posts }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/search:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
