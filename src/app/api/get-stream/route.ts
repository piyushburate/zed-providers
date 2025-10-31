"use server";

import { getProvider } from "@/lib/getProvider";
import { GetStreamParams, Source } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = getProvider(params.get("provider") || "");
  const link = params.get("link");
  const type = params.get("type");

  if (provider == null) {
    return NextResponse.json({ error: "Invalid Provider" }, { status: 400 });
  }
  if (!link) {
    return NextResponse.json({ error: "Link is required" }, { status: 400 });
  }
  if (!type) {
    return NextResponse.json({ error: "Type is required" }, { status: 400 });
  }

  try {
    const scrapper = provider.scrapper.stream || provider.scrapper.default;
    const {
      getStream,
    }: { getStream: (params: GetStreamParams) => Promise<Source[]> } =
      await import(`@/scrappers/${scrapper}/stream`);

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
