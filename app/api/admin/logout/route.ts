import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin";
export async function POST() { const r = NextResponse.json({ ok: true }); r.cookies.delete(adminCookie); return r; }
