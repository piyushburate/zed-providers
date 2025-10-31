"use server";

import { getProvider } from "@/lib/getProvider";
import { Catalog } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = getProvider(params.get("provider") || "");

  if (provider == null) {
    return NextResponse.json({ error: "Invalid Provider" }, { status: 400 });
  }

  try {
    const scrapper = provider.scrapper.catalog || provider.scrapper.default;

    const {
      featured,
      home,
      genres,
    }: { featured: Catalog; home: Catalog[]; genres: Catalog[] } = await import(
      `@/scrappers/${scrapper}/catalog`
    );

    return NextResponse.json(
      { data: { featured, home, genres } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/get-catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}
