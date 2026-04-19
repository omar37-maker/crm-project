"use client";

import { useDashboardOverview } from "@/lib/tanstack/useDashboardOverview";
import { AlertCircle, Percent, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";
import KpiCard from "./KpiCard";
import { Role } from "@/generated/prisma/enums";
import ByStageBreakdown from "./ByStageBreakdown";
import ByStatusBreakdown from "./ByStatusBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

function formatWeekOverWeekSubtext(
  percentChange: number | null,
): string | undefined {
  if (percentChange === null) {
    return "No new leads in the prior week to compare";
  }
  const sign = percentChange > 0 ? "+" : "";
  return `${sign}${percentChange.toFixed(1)}% vs last week`;
}

export function DashboardPageClient({ role }: { role: Role }) {
  const { data, isLoading, error } = useDashboardOverview();

  const subHeaderText = useMemo(
    () =>
      role === "AGENT"
        ? "Review the current state of your leads in your pipeline."
        : "Review the current state of the pipeline in your organization.",
    [role],
  );

  const isManagerOrAdmin = role !== "AGENT";

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{subHeaderText}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        {isManagerOrAdmin ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : null}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{subHeaderText}</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-sm text-destructive">
            Failed to load dashboard. {error?.message ?? "Please try again."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{subHeaderText}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total leads"
          value={data.totalLeads}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          label="New leads this week"
          value={data.newLeadsThisWeek.count}
          icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
          subValue={formatWeekOverWeekSubtext(
            data.newLeadsThisWeek.percentChangeFromLastWeek,
          )}
        />
        <KpiCard
          label="Conversion rate"
          value={`${data.conversionRate.percentage.toFixed(1)}%`}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
          subValue={`${data.conversionRate.won} won / ${data.conversionRate.total} total leads`}
        />
        <KpiCard
          label="Overdue reminders"
          value={data.overdueRemindersCount}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ByStageBreakdown data={data.totalLeadsByStage} />
        <ByStatusBreakdown data={data.totalLeadsByStatus} />
      </div>

      {data.topAgents ? (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No agents to show yet.
              </p>
            ) : (
              data.topAgents.map((agent) => (
                <div key={agent.id} className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Won {agent.wonCount} of {agent.leadsCount} leads
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
