import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormSchema, AttentionCheckResult } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("form_submissions")
    .select("*", { count: "exact" })
    .eq("form_id", formId)
    .eq("is_complete", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count, page, limit });
}

// Public endpoint — no auth required for published forms
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = createAdminClient();

  // Verify form is published or in pilot mode
  const { data: form } = await supabase
    .from("forms")
    .select("id, status, schema")
    .eq("id", formId)
    .in("status", ["published", "pilot"])
    .single();

  if (!form) {
    return NextResponse.json({ error: "Form not found or not published" }, { status: 404 });
  }

  const body = await request.json();
  const userAgent = request.headers.get("user-agent") || "";
  const schema = form.schema as FormSchema;

  // Evaluate attention checks
  const attentionChecks: AttentionCheckResult[] = [];
  for (const page of schema.pages) {
    for (const el of page.elements) {
      if (el.type === "attention_check" && el.properties.correctAnswer) {
        const answer = body.data?.[el.id];
        attentionChecks.push({
          fieldId: el.id,
          passed: String(answer) === String(el.properties.correctAnswer),
        });
      }
    }
  }

  // Compute field completion map
  const fieldCompletion: Record<string, boolean> = {};
  for (const page of schema.pages) {
    for (const el of page.elements) {
      if (["heading", "paragraph", "divider"].includes(el.type)) continue;
      const val = body.data?.[el.id];
      fieldCompletion[el.id] = val !== undefined && val !== null && val !== "" &&
        !(Array.isArray(val) && val.length === 0);
    }
  }

  const { data, error } = await supabase
    .from("form_submissions")
    .insert({
      form_id: formId,
      data: body.data || {},
      metadata: {
        user_agent: userAgent,
        started_at: body.started_at || null,
        completed_at: new Date().toISOString(),
        duration_ms: body.duration_ms || null,
        attention_checks: attentionChecks.length > 0 ? attentionChecks : undefined,
        field_completion: fieldCompletion,
        is_pilot: form.status === "pilot" ? true : undefined,
      },
      is_complete: true,
      page_history: body.page_history || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Increment analytics (non-blocking)
  try {
    const today = new Date().toISOString().slice(0, 10);
    await supabase.rpc("increment_form_analytics", {
      p_form_id: formId,
      p_date: today,
      p_field: "completions",
    });
  } catch {
    // Analytics RPC may not exist yet — non-blocking
  }

  return NextResponse.json(data, { status: 201 });
}
