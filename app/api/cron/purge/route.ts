import { NextResponse } from "next/server";
import { purgeCapacityFiles } from "@/lib/store";
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ deleted: await purgeCapacityFiles(Number(process.env.RETENTION_DAYS ?? 30)) });
}
