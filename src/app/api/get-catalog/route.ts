"use server";

import { verifyProvider } from "@/lib/verifyProvider";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const provider = params.get("provider");

  if (!(provider && verifyProvider(provider))) {
    return NextResponse.json(
      { error: "Invalid Provider" },
      { status: 400 }
    );
  }

  try {
    const { catalog, genres } = await import(`@/providers/${provider}/catalog`);

    return NextResponse.json({ data: { catalog, genres } }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/get-catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}
