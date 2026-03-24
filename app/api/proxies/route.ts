import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const col = await getCollection("free-proxy");
    const { searchParams } = req.nextUrl;

    const filter: Record<string, string> = {};
    if (searchParams.get("status")) filter.status = searchParams.get("status")!;
    if (searchParams.get("type")) filter.type = searchParams.get("type")!;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    const [proxies, total] = await Promise.all([
      col.find(filter).sort({ scrapedAt: -1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);

    return NextResponse.json({
      proxies,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
