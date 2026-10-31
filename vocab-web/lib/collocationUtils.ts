import { VocabItem } from "@/data/vocabData";

export interface CollocationData {
  id: number;
  vocab: string;
  reading: string;
  meaning: string;
  jpPhrase: string;
  viMeaning: string;
  before: string;
  after: string;
  notes: string;
  isCorrect: boolean;
}

/**
 * Extracts collocation phrase, Vietnamese meaning, and cloze parts from a VocabItem
 */
export function parseCollocation(item: VocabItem): CollocationData {
  const ex = item.example || "";
  let jp = "";
  let vi = "";

  const match = ex.match(/^([^(（]+)[(（]([^)）]+)[)）]/);
  if (match) {
    jp = match[1].trim();
    vi = match[2].trim();
  } else if (ex.trim()) {
    jp = ex.trim();
    vi = item.meaning;
  } else {
    jp = item.vocab;
    vi = item.meaning;
  }

  // Find target word position in Japanese phrase
  let foundWord = item.vocab;
  let idx = jp.indexOf(foundWord);

  if (idx === -1) {
    const r = item.reading.replace(/[（(].*?[)）]/g, "").trim();
    if (r && jp.includes(r)) {
      foundWord = r;
      idx = jp.indexOf(r);
    } else {
      const stem = item.vocab.replace(/[るすうな]$/, "");
      if (stem && stem.length >= 2 && jp.includes(stem)) {
        foundWord = stem;
        idx = jp.indexOf(stem);
      }
    }
  }

  let before = "";
  let after = "";

  if (idx !== -1) {
    before = jp.substring(0, idx);
    after = jp.substring(idx + foundWord.length);
  } else {
    before = "";
    after = " " + jp;
  }

  return {
    id: item.id,
    vocab: item.vocab,
    reading: item.reading,
    meaning: item.meaning,
    jpPhrase: jp,
    viMeaning: vi,
    before,
    after,
    notes: item.notes,
    isCorrect: item.isCorrect,
  };
}

/**
 * Generates 4 choices (1 correct + 3 distractors) for collocation cloze quiz
 */
export function generateCollocationOptions(
  currentItem: CollocationData,
  allList: CollocationData[]
): string[] {
  const correct = currentItem.vocab;
  const distractors: string[] = [];
  const pool = allList.filter((x) => x.vocab !== correct);

  while (distractors.length < 3 && pool.length > 0) {
    const randIdx = Math.floor(Math.random() * pool.length);
    const candidate = pool[randIdx].vocab;
    if (!distractors.includes(candidate)) {
      distractors.push(candidate);
    }
    pool.splice(randIdx, 1);
  }

  const options = [...distractors, correct];
  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
}
