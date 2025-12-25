// app/api/search/route.js
import { NextResponse } from "next/server";
// import { searchAll } from "@/server/services/search";
import { searchAll } from "@/features/search/services/searchService";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const limitRaw = searchParams.get("limit") || "10";

    let limit = Number(limitRaw);
    if (Number.isNaN(limit) || limit < 1 || limit > 50) {
      limit = 10;
    }

    const results = await searchAll(query, limit);

    return NextResponse.json({
      ok: true,
      results,
    });
  } catch (err) {
    console.error("Search API error", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Search failed",
        results: {
          people: [],
          images: [],
          blogs: [],
        },
      },
      { status: 500 },
    );
  }
}
