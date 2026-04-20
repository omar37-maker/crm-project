"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ADMIN_TABS = [
  { label: "Users", href: "/admin/users" },
  { label: "Import", href: "/admin/import" },
  { label: "Export", href: "/admin/export" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeTab =
    ADMIN_TABS.find((tab) => pathname?.startsWith(tab.href))?.href ??
    ADMIN_TABS[0].href;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team, imports, and exports.
        </p>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList>
          {ADMIN_TABS.map((tab) => (
            <TabsTrigger key={tab.href} value={tab.href} asChild>
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div>{children}</div>
    </div>
  );
}
