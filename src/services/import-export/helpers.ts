import Papa from "papaparse";
import { csvLeadRowSchema, RowValidationResult } from "./schema";

export function parseCSV(file: File) {
  return new Promise<Record<string, string>[]>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parsing warnings:", results.errors);
        }
        resolve(results.data as Record<string, string>[]);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        reject(new Error("Failed to parse CSV file"));
      },
    });
  });
}

export function validateRows(
  rows: Record<string, string>[],
): RowValidationResult[] {
  return rows.map((row, index) => {
    const result = csvLeadRowSchema.safeParse(row);

    if (result.success) {
      return {
        rowNumber: index + 2, // +1 for header row, +1 for 0-indexing
        valid: true,
        data: result.data,
        errors: null,
      };
    }

    return {
      rowNumber: index + 2,
      valid: false,
      data: null,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  });
}

// ------------------------------------------------------------------
// BUILD CSV STRING
// ------------------------------------------------------------------
/**
 * Convert an array of objects to a CSV string.
 * Handles escaping of fields that contain commas, quotes, or newlines.
 *
 * Why not use Papa.unparse()?
 * Papa.unparse works fine too. We write our own for transparency —
 * students should understand CSV escaping rules:
 * 1. If a field contains a comma, quote, or newline → wrap in quotes
 * 2. If a field contains a quote → double the quote ("" inside "")
 *
 * @param data - Array of objects to convert
 * @param headers - Optional column order. If omitted, uses Object.keys of first row.
 */
export function buildCSVString(
  data: Record<string, unknown>[],
  headers?: string[],
): string {
  if (data.length === 0) return "";

  const columns = headers ?? Object.keys(data[0]);
  const headerRow = columns.map(escapeField).join(",");

  const dataRows = data.map((row) =>
    columns.map((col) => escapeField(String(row[col] ?? ""))).join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Escape a single CSV field.
 *
 * RFC 4180 rules:
 * - If the field contains comma, quote, or newline → wrap in double quotes
 * - If the field contains a double quote → escape it by doubling ("" → "")
 */
function escapeField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ------------------------------------------------------------------
// GENERATE TEMPLATE CSV
// ------------------------------------------------------------------
/**
 * Generate a downloadable template CSV with headers and example rows.
 * Admins can download this template, fill it in, and re-upload.
 */
export function generateTemplateCSV(): string {
  const examples = [
    {
      phone: "+15551234567",
      name: "Jane Smith",
      email: "jane@example.com",
      assigneeEmail: "agent@company.com",
    },
    {
      phone: "+15559876543",
      name: "Bob Johnson",
      email: "",
      assigneeEmail: "",
    },
  ];

  return buildCSVString(examples, ["phone", "name", "email", "assigneeEmail"]);
}
