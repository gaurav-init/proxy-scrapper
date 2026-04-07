import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const portScan = require(require("path").join(process.cwd(), "port-scan.js"));
    await portScan();
    return NextResponse.json({ ok: true, ran: "port-scan", at: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
