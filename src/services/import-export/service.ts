import { Profile } from "@/generated/prisma/client";
import { LeadService } from "../lead";
import { dbFindProfileByEmail } from "./db";
import { CSVLeadRow, ImportSummary } from "./schema";

export async function processImport(
  rows: CSVLeadRow[],
  importerProfile: Profile,
): Promise<ImportSummary> {
  let importedCount = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      // --- Resolve assignee ---
      // If the CSV row includes an assigneeEmail, look up the
      // corresponding Profile. If not found, skip this row and
      // record the error — don't create an orphaned lead.
      let assignedToId: string | undefined;
      if (row.assigneeEmail) {
        const assignee = await dbFindProfileByEmail(row.assigneeEmail);

        if (!assignee) {
          errors.push(
            `Row (${row.phone}): Assignee "${row.assigneeEmail}" not found`,
          );
          continue;
        }

        if (!assignee.isActive) {
          errors.push(
            `Row (${row.phone}): Assignee "${row.assigneeEmail}" is deactivated`,
          );
          continue;
        }

        assignedToId = assignee.id;
      }

      // --- Create lead ---
      const lead = await LeadService.createLead(importerProfile, row);

      // --- Assign if Assignee is Provided ---
      if (assignedToId) {
        await LeadService.updateLead(importerProfile, lead.id, {
          assignedToId,
        });
      }

      importedCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Row (${row.phone}): ${message}`);
    }
  }

  return {
    importedCount,
    totalProcessed: rows.length,
    errors,
  };
}
