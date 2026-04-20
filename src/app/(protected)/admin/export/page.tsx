import { redirect } from "next/navigation";

import { ExportButton } from "@/components/leads/ExportButton";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Export Leads — CRM Pro Admin",
};

export default async function AdminExportPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true },
  });

  if (!profile || profile.role !== "ADMIN" || !profile.isActive) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export Leads</h1>
        <p className="text-muted-foreground mt-1">
          Download a CSV snapshot of every lead in the pipeline. The file uses
          the same column order as the import template, so you can round-trip:
          export, edit in a spreadsheet, then re-import.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">All leads</p>
            <p className="text-sm text-muted-foreground">
              Filename includes today&apos;s date for self-documenting exports.
            </p>
          </div>
          <ExportButton />
        </div>
      </div>
    </div>
  );
}
