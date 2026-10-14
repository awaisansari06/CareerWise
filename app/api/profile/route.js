import { NextResponse } from "next/server";

/**
 * Handles automated profile probe requests (e.g. from browser extensions,
 * job assistants, or lingering localhost service workers) to prevent
 * noisy 404 log spam in the Next.js terminal.
 */
export async function GET() {
  return NextResponse.json({ ok: true, status: "active" }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ ok: true, status: "active" }, { status: 200 });
}
