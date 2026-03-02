import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { createDefaultFormSchema } from "@/lib/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = request.nextUrl.searchParams.get("workspace_id");

  let query = supabase
    .from("forms")
    .select("id, workspace_id, title, slug, description, schema, status, published_at, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Ensure user has a workspace, create default if not
  let workspaceId = body.workspace_id;
  if (!workspaceId) {
    const { data: workspaces } = await supabase
      .from("form_workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1);

    if (workspaces && workspaces.length > 0) {
      workspaceId = workspaces[0].id;
    } else {
      const { data: newWorkspace, error: wsError } = await supabase
        .from("form_workspaces")
        .insert({
          owner_id: user.id,
          name: "Meu Workspace",
          slug: "meu-workspace-" + Date.now().toString(36),
        })
        .select()
        .single();

      if (wsError) return NextResponse.json({ error: wsError.message }, { status: 500 });
      workspaceId = newWorkspace.id;
    }
  }

  const title = body.title || "Formulário sem título";
  const schema = body.schema || createDefaultFormSchema();
  schema.title = title;

  const { data, error } = await supabase
    .from("forms")
    .insert({
      workspace_id: workspaceId,
      title,
      slug: slugify(title) + "-" + Date.now().toString(36),
      description: body.description || null,
      schema,
      status: "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
