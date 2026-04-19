"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExportButton() {
  function handleExport() {
    window.location.href = "/api/leads/export";
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
