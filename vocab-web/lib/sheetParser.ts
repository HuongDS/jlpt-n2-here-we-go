import * as XLSX from "xlsx";
import { VocabItem } from "@/data/vocabData";

type RowValue = string | number | null | undefined;

/**
 * Parses raw 2D array from XLSX or CSV into standard VocabItem[]
 */
export function parseSheetRows(rawRows: RowValue[][]): VocabItem[] {
  if (!rawRows || rawRows.length < 2) return [];

  // Find header indices
  const header = (rawRows[0] || []).map((h) =>
    String(h || "").toLowerCase().trim()
  );

  let sttIdx = header.findIndex((h) => h.includes("stt"));
  let vocabIdx = header.findIndex(
    (h) => h.includes("vựng") || h.includes("vocab") || h.includes("kanji") || h.includes("từ")
  );
  let readingIdx = header.findIndex(
    (h) => h.includes("đọc") || h.includes("reading") || h.includes("kana") || h.includes("furigana")
  );
  let meaningIdx = header.findIndex(
    (h) => h.includes("nghĩa") || h.includes("meaning") || h.includes("dịch")
  );
  let exampleIdx = header.findIndex(
    (h) => h.includes("ví dụ") || h.includes("dụ") || h.includes("example") || h.includes("câu")
  );
  let notesIdx = header.findIndex(
    (h) => h.includes("ghi chú") || h.includes("chú") || h.includes("note") || h.includes("đặc điểm")
  );

  // Fallbacks if header names differ
  if (sttIdx === -1) sttIdx = 0;
  if (vocabIdx === -1) vocabIdx = 1;
  if (readingIdx === -1) readingIdx = 2;
  if (meaningIdx === -1) meaningIdx = 3;
  if (exampleIdx === -1) exampleIdx = 4;
  if (notesIdx === -1) notesIdx = 5;

  const items: VocabItem[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !row[vocabIdx]) continue;

    const vocab = String(row[vocabIdx] || "").trim();
    if (!vocab) continue;

    const reading = String(row[readingIdx] || "").trim();
    const meaning = String(row[meaningIdx] || "").trim();
    const example = String(row[exampleIdx] || "").trim();
    const notes = String(row[notesIdx] || "").trim();
    const isCorrect =
      notes.includes("[Đáp án đúng") ||
      notes.toLowerCase().includes("đáp án đúng");

    let id = Number(row[sttIdx]);
    if (isNaN(id) || id <= 0) {
      id = items.length + 1;
    }

    items.push({
      id,
      vocab,
      reading,
      meaning,
      example,
      notes,
      isCorrect,
    });
  }

  return items;
}

/**
 * Parses an Excel (.xlsx / .xls) or CSV File selected from the browser
 */
export async function parseFileFromBrowser(file: File): Promise<VocabItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<RowValue[]>(worksheet, { header: 1 });
  return parseSheetRows(rawRows);
}

/**
 * Converts a Google Sheets URL into its public CSV export link
 */
export function convertGoogleSheetsUrlToCsv(url: string): string {
  const trimmed = url.trim();
  // If already a csv export link
  if (trimmed.includes("output=csv") || trimmed.includes("format=csv")) {
    return trimmed;
  }
  // Standard Google Sheets URL: https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    // Check if there is a specific gid: ...gid=12345
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
  }
  return trimmed;
}

/**
 * Fetches and parses a public Google Sheets CSV URL
 */
export async function fetchGoogleSheetCsv(url: string): Promise<VocabItem[]> {
  const csvUrl = convertGoogleSheetsUrlToCsv(url);
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Không thể tải Google Sheet (Mã lỗi HTTP ${response.status})`);
  }
  const csvText = await response.text();
  const workbook = XLSX.read(csvText, { type: "string" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<RowValue[]>(worksheet, { header: 1 });
  return parseSheetRows(rawRows);
}
