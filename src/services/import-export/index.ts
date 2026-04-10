import { csvLeadRowSchema, importRequestSchema } from "./schema";
import { processImport } from "./service";

export const ImportExportService = {
  import: {
    process: processImport,
  },
};

export const ImportExportSchema = {
  import: {
    request: importRequestSchema,
    csvLeadRow: csvLeadRowSchema,
  },
};
