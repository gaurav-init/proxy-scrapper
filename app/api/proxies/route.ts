import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const col = await getCollection("free-proxy");
    const { searchParams } = req.nextUrl;

    const filter: Record<string, any> = {};
    if (searchParams.get("status")) filter.status = searchParams.get("status")!;
    if (searchParams.get("type")) filter.type = searchParams.get("type")!;
    if (searchParams.get("country")) filter.country = searchParams.get("country")!;

    // Port filters: smtp, http, or specific port number
    const portFilter = searchParams.get("port");
    if (portFilter === "smtp") {
      filter["smtpPorts.0"] = { $exists: true };
    } else if (portFilter === "http") {
      filter["httpPorts.0"] = { $exists: true };
    } else if (portFilter === "25") {
      filter.smtpPorts = 25;
    } else if (portFilter === "587") {
      filter.smtpPorts = 587;
    } else if (portFilter === "465") {
      filter.smtpPorts = 465;
    } else if (portFilter === "80") {
      filter.httpPorts = 80;
    } else if (portFilter === "443") {
      filter.httpPorts = 443;
    } else if (portFilter === "8080") {
      filter.httpPorts = 8080;
    }

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
