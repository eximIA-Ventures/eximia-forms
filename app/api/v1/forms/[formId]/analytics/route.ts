import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: analytics, error: analyticsError } = await supabase
    .from("form_analytics")
    .select("*")
    .eq("form_id", formId)
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  if (analyticsError) return NextResponse.json({ error: analyticsError.message }, { status: 500 });

  // Also get total submissions count
  const { count: totalSubmissions } = await supabase
    .from("form_submissions")
    .select("*", { count: "exact", head: true })
    .eq("form_id", formId)
    .eq("is_complete", true);

  const totals = (analytics || []).reduce(
    (acc, row) => ({
      views: acc.views + row.views,
      starts: acc.starts + row.starts,
      completions: acc.completions + row.completions,
    }),
    { views: 0, starts: 0, completions: 0 }
  );

  return NextResponse.json({
    daily: analytics,
    totals,
    totalSubmissions: totalSubmissions || 0,
    completionRate: totals.starts > 0
      ? Math.round((totals.completions / totals.starts) * 100)
      : 0,
  });
}
