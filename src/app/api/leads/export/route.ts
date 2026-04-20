import { Role } from "@/generated/prisma/client";
import { ImportExportService } from "@/services/import-export";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";

export async function GET() {
  try {
    const profile = await authenticateUser([
      Role.AGENT,
      Role.MANAGER,
      Role.ADMIN,
    ]);

    const csv = await ImportExportService.export.process(profile);
    const datestamp = new Date().toISOString().split("T")[0];
    const filename = `leads-export-${datestamp}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
