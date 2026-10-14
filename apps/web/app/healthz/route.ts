import { NextResponse } from "next/server";

/** Liveness probe: GET /healthz → { status: "ok" }. */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
