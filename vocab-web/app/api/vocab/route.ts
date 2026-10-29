import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { VOCAB_LIST, VocabItem } from "@/data/vocabData";

type RowValue = string | number | null | undefined;

export async function GET() {
  try {
    const baseDir = path.resolve(process.cwd(), "..");
    const excelPath = path.join(baseDir, "Tu_Vung_On_Tap_JLPT_N2.xlsx");
    const csvPath = path.join(baseDir, "tu_vung.csv");

    let items: VocabItem[] = [];
    let source = "static";
    let lastModified = new Date().toISOString();

    if (fs.existsSync(excelPath)) {
      try {
        const stats = fs.statSync(excelPath);
        lastModified = stats.mtime.toISOString();
        const fileBuffer = fs.readFileSync(excelPath);
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<RowValue[]>(sheet, { header: 1 });

        if (rawRows.length > 1) {
          const header = (rawRows[0] || []).map((h) =>
            String(h || "").toLowerCase().trim()
          );

          let sttIdx = header.findIndex((h) => h.includes("stt"));
          let vocabIdx = header.findIndex((h) => h.includes("vựng") || h.includes("vocab"));
          let readingIdx = header.findIndex((h) => h.includes("đọc") || h.includes("reading"));
          let meaningIdx = header.findIndex((h) => h.includes("nghĩa") || h.includes("meaning"));
          let exampleIdx = header.findIndex((h) => h.includes("ví dụ") || h.includes("dụ") || h.includes("example"));
          let notesIdx = header.findIndex((h) => h.includes("ghi chú") || h.includes("chú") || h.includes("note"));

          if (sttIdx === -1) sttIdx = 0;
          if (vocabIdx === -1) vocabIdx = 1;
          if (readingIdx === -1) readingIdx = 2;
          if (meaningIdx === -1) meaningIdx = 3;
          if (exampleIdx === -1) exampleIdx = 4;
          if (notesIdx === -1) notesIdx = 5;

          for (let r = 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!row || !row[vocabIdx]) continue;

            const vocab = String(row[vocabIdx] || "").trim();
            if (!vocab) continue;

            const reading = String(row[readingIdx] || "").trim();
            const meaning = String(row[meaningIdx] || "").trim();
            const example = String(row[exampleIdx] || "").trim();
            const notes = String(row[notesIdx] || "").trim();
            const isCorrect = notes.includes("[Đáp án đúng") || notes.toLowerCase().includes("đáp án đúng");

            items.push({
              id: Number(row[sttIdx]) || r,
              vocab,
              reading,
              meaning,
              example,
              notes,
              isCorrect,
            });
          }

          if (items.length > 0) {
            source = "Tu_Vung_On_Tap_JLPT_N2.xlsx";
          }
        }
      } catch (err) {
        console.error("Error reading Excel file:", err);
      }
    }

    if (items.length === 0 && fs.existsSync(csvPath)) {
      try {
        const stats = fs.statSync(csvPath);
        lastModified = stats.mtime.toISOString();
        const csvContent = fs.readFileSync(csvPath, "utf-8");
        const workbook = XLSX.read(csvContent, { type: "string" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<RowValue[]>(sheet, { header: 1 });

        for (let r = 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || !row[1]) continue;

          const vocab = String(row[1] || "").trim();
          if (!vocab) continue;

          const notes = String(row[5] || "").trim();
          items.push({
            id: Number(row[0]) || r,
            vocab,
            reading: String(row[2] || "").trim(),
            meaning: String(row[3] || "").trim(),
            example: String(row[4] || "").trim(),
            notes,
            isCorrect: notes.includes("[Đáp án đúng"),
          });
        }

        if (items.length > 0) {
          source = "tu_vung.csv";
        }
      } catch (err) {
        console.error("Error reading CSV file:", err);
      }
    }

    if (items.length === 0) {
      items = VOCAB_LIST;
      source = "built-in";
    }

    return NextResponse.json({
      success: true,
      source,
      count: items.length,
      lastModified,
      items,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sync vocabulary";
    return NextResponse.json(
      {
        success: false,
        error: message,
        items: VOCAB_LIST,
      },
      { status: 500 }
    );
  }
}
