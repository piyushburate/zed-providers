"use server";

import { getProvider } from "@/lib/getProvider";
import { EpisodeLink, GetEpisodesParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = getProvider(params.get("provider") || "");
  const link = params.get("link");

  if (provider == null) {
    return NextResponse.json({ error: "Invalid Provider" }, { status: 400 });
  }
  if (!link) {
    return NextResponse.json({ error: "Link is required" }, { status: 400 });
  }

  try {
    const scrapper = provider.scrapper.episodes || provider.scrapper.default;
    const {
      getEpisodes,
    }: { getEpisodes: (params: GetEpisodesParams) => Promise<EpisodeLink[]> } =
      await import(`@/scrappers/${scrapper}/episodes`);

    const episodes = await getEpisodes({ link });

    return NextResponse.json({ data: episodes }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/get-episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}
