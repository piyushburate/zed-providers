"use server";

import { getProvider } from "@/lib/getProvider";
import { GetMetaParams, Info } from "@/lib/types";
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
    const scrapper = provider.scrapper.meta || provider.scrapper.default;
    const { getMeta }: { getMeta: (params: GetMetaParams) => Promise<Info> } =
      await import(`@/scrappers/${scrapper}/meta`);

    const meta = await getMeta({ link });

    return NextResponse.json({ data: meta }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/get-meta:", error);
    return NextResponse.json(
      { error: "Failed to fetch meta" },
      { status: 500 }
    );
  }
}
