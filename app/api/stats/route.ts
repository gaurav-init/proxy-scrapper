import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const col = await getCollection("free-proxy");

    const [byType, byStatus, total] = await Promise.all([
      col.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]).toArray(),
      col.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      col.countDocuments(),
    ]);

    const activeByType = await col
      .aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ])
      .toArray();

    return NextResponse.json({
      total,
      byType: Object.fromEntries(byType.map((r) => [r._id, r.count])),
      byStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])),
      activeByType: Object.fromEntries(activeByType.map((r) => [r._id, r.count])),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
