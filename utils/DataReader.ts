import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

export interface DataReaderOptions {
  sheetName?: string;
}

export function readJson<T = unknown>(filePath: string): T {
  const resolvedPath = path.resolve(filePath);
  return JSON.parse(readFileSync(resolvedPath, "utf8")) as T;
}

export function readTestData<T = Record<string, unknown>>(
  filePath: string,
  options: DataReaderOptions = {},
): T[] {
  const resolvedPath = path.resolve(filePath);
  const extension = path.extname(resolvedPath).toLowerCase();

  if (extension === ".json") {
    const data: unknown = readJson(resolvedPath);
    if (!Array.isArray(data)) {
      throw new TypeError(`Expected a JSON array in "${resolvedPath}".`);
    }
    return data as T[];
  }

  if (extension === ".csv") {
    const content = readFileSync(resolvedPath, "utf8");
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as T[];
  }

  if (extension === ".xlsx" || extension === ".xls") {
    const workbook = XLSX.readFile(resolvedPath);
    const sheetName = options.sheetName ?? workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new RangeError(`Worksheet "${sheetName}" was not found in "${resolvedPath}".`);
    }
    return XLSX.utils.sheet_to_json<T>(worksheet, { defval: null });
  }

  throw new TypeError(`Unsupported test-data file type "${extension}".`);
}
