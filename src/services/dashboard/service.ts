import { Role } from "@/generated/prisma/client";
import { UserSnapshot } from "@/utils/types/user";
import {
  dbCountLeadsCreatedInRange,
  dbGetOverdueRemindersCount,
  dbGetTopAgents,
  dbGetTotalLeads,
  dbGetTotalLeadsByStage,
  dbGetTotalLeadsByStatus,
  dbGetWonAndTotalLeads,
} from "./db";
import { startOfUtcWeekSunday } from "./helpers";

export async function getDashboardData(user: UserSnapshot) {
  const where = {
    ...(user.role === Role.AGENT && { assignedToId: user.id }),
  };

  const now = new Date();
  const thisWeekStartUtc = startOfUtcWeekSunday(now);
  const lastWeekStartUtc = new Date(thisWeekStartUtc);
  lastWeekStartUtc.setUTCDate(lastWeekStartUtc.getUTCDate() - 7);

  const [
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    newLeadsThisWeekCount,
    newLeadsLastWeekCount,
    { total: conversionTotal, won: conversionWon },
  ] = await Promise.all([
    dbGetTotalLeads(where),
    dbGetTotalLeadsByStage(where),
    dbGetTotalLeadsByStatus(where),
    dbGetOverdueRemindersCount(where),
    dbCountLeadsCreatedInRange(where, {
      gte: thisWeekStartUtc,
      lte: now,
    }),
    dbCountLeadsCreatedInRange(where, {
      gte: lastWeekStartUtc,
      lt: thisWeekStartUtc,
    }),
    dbGetWonAndTotalLeads(where),
  ]);

  const percentChangeFromLastWeek =
    newLeadsLastWeekCount === 0
      ? null
      : ((newLeadsThisWeekCount - newLeadsLastWeekCount) /
          newLeadsLastWeekCount) *
        100;

  const conversionRate =
    conversionTotal === 0 ? 0 : (conversionWon / conversionTotal) * 100;

  let topAgents: Awaited<ReturnType<typeof dbGetTopAgents>> = [];

  if (user.role !== Role.AGENT) {
    topAgents = await dbGetTopAgents();
  }

  return {
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    newLeadsThisWeek: {
      count: newLeadsThisWeekCount,
      lastWeekCount: newLeadsLastWeekCount,
      percentChangeFromLastWeek,
    },
    conversionRate: {
      percentage: conversionRate,
      won: conversionWon,
      total: conversionTotal,
    },
    ...(user.role !== Role.AGENT && { topAgents }),
  };
}
