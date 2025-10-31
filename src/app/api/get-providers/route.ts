"use server";

import { NextResponse } from "next/server";
import { providers } from "@/data/providers";

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({ data: providers }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/get-providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
