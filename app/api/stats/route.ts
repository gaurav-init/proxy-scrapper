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

    const [smtp25, smtp587, anySmtp, http80, http443, anyHttp] =
      await Promise.all([
        col.countDocuments({ smtpPorts: 25 }),
        col.countDocuments({ smtpPorts: 587 }),
        col.countDocuments({ "smtpPorts.0": { $exists: true } }),
        col.countDocuments({ httpPorts: 80 }),
        col.countDocuments({ httpPorts: 443 }),
        col.countDocuments({ "httpPorts.0": { $exists: true } }),
      ]);

    return NextResponse.json({
      total,
      byType: Object.fromEntries(byType.map((r) => [r._id, r.count])),
      byStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])),
      activeByType: Object.fromEntries(activeByType.map((r) => [r._id, r.count])),
      ports: {
        smtp: { 25: smtp25, 587: smtp587, any: anySmtp },
        http: { 80: http80, 443: http443, any: anyHttp },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
