# -*- coding: utf-8 -*-
import json
import build_vocabulary_excel

data = []
for idx, item in enumerate(build_vocabulary_excel.vocab_items, 1):
    vocab, reading, meaning, example, notes, is_correct = item
    data.append({
        "id": idx,
        "vocab": vocab,
        "reading": reading,
        "meaning": meaning,
        "example": example,
        "notes": notes,
        "isCorrect": is_correct
    })

with open("vocab_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Exported {len(data)} items to vocab_data.json")
