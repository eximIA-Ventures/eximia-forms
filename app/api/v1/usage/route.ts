import { NextResponse } from "next/server";
import { getUserPlanUsage } from "@/lib/plans";

export async function GET() {
  const usage = await getUserPlanUsage();
  if (!usage) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(usage);
}
