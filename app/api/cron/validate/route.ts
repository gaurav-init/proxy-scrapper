import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const validate = require("../../../../../validate.js");
    await validate();
    return NextResponse.json({ ok: true, ran: "validate", at: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
