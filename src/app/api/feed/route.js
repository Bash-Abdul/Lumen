import { NextResponse } from "next/server";
import { getFeedPosts } from "@/server/services/feedData";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const feedType = searchParams.get("type") || "forYou";
    const cursor = searchParams.get("cursor") || null;
    const limit = Number(searchParams.get("limit") || 20);

    const result = await getFeedPosts(feedType, limit, cursor);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
