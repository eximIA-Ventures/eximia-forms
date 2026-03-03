import { createAdminClient } from "@/lib/supabase/admin";
import { PublicFormClient } from "./client";
import type { Metadata } from "next";
import type { FormSchema } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: form } = await supabase
    .from("forms")
    .select("title, description")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return {
    title: form?.title || "Formulário",
    description: form?.description || "Preencha o formulário",
  };
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: form, error } = await supabase
    .from("forms")
    .select("id, title, slug, schema, status")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="px-4 text-center">
          <h1 className="text-2xl font-bold">Formulário não encontrado</h1>
          <p className="mt-2 text-muted">
            Este formulário pode ter sido encerrado ou não existe.
          </p>
        </div>
      </div>
    );
  }

  const schema = form.schema as FormSchema;
  const bgColor = schema.theme?.backgroundColor;
  const isLight = schema.theme?.mode === "light";

  return (
    <div
      className={isLight ? "min-h-screen py-8" : "min-h-screen bg-bg py-8"}
      style={{ backgroundColor: bgColor || (isLight ? "#FFFFFF" : undefined) }}
    >
      <PublicFormClient
        formId={form.id}
        schema={schema}
      />
    </div>
  );
}
