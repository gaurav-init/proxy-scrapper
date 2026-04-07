import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const scrape = require("../../../../../scrape.js");
    await scrape();
    return NextResponse.json({ ok: true, ran: "scrape", at: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
