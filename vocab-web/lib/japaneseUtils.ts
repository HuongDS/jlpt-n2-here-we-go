// Japanese Kana and Reading Normalization Utilities

export const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', tu: 'つ', te: 'て', to: 'と',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を', n: 'ん', nn: 'ん',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
  jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
};

// Convert Katakana to Hiragana
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

// Convert Hiragana to Katakana
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

// Quick romaji to hiragana converter
export function romajiToHiragana(romaji: string): string {
  let result = romaji.toLowerCase().trim();
  // Handle double consonants (促音 っ)
  result = result.replace(/([bcdfghjklmpqrstvwxyz])\1/g, 'っ$1');
  
  // Sort keys by length descending to match longest sequences first
  const keys = Object.keys(ROMAJI_TO_HIRAGANA).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const val = ROMAJI_TO_HIRAGANA[key];
    result = result.split(key).join(val);
  }
  return result;
}

// Clean string for comparison
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '')
    .replace(/[・、。，,\/]/g, '')
    .toLowerCase();
}

export function parseReadingField(rawReading: string): {
  primary: string;
  kanjiVariant?: string;
  acceptableAnswers: string[];
} {
  const trimmed = rawReading.trim();
  // Match pattern like "とらえる (捉える)"
  const parenMatch = trimmed.match(/^([^\(（]+)[\(（]([^\)）]+)[\)）]$/);
  
  if (parenMatch) {
    const primary = parenMatch[1].trim();
    const kanjiVariant = parenMatch[2].trim();
    const cleanPrimary = cleanText(primary);
    const cleanKanji = cleanText(kanjiVariant);
    const hira = katakanaToHiragana(cleanPrimary);
    const kata = hiraganaToKatakana(cleanPrimary);
    
    return {
      primary,
      kanjiVariant,
      acceptableAnswers: Array.from(new Set([
        cleanPrimary,
        cleanKanji,
        hira,
        kata,
        cleanText(trimmed)
      ]))
    };
  }

  const clean = cleanText(trimmed);
  const hira = katakanaToHiragana(clean);
  const kata = hiraganaToKatakana(clean);

  return {
    primary: trimmed,
    acceptableAnswers: Array.from(new Set([clean, hira, kata]))
  };
}

export function checkReadingMatch(userInput: string, targetReading: string, targetVocab?: string): boolean {
  if (!userInput.trim()) return false;
  
  const userClean = cleanText(userInput);
  
  // Also match targetVocab directly if provided (e.g. typing the Kanji itself in dictation)
  if (targetVocab && cleanText(targetVocab) === userClean) {
    return true;
  }

  const parsed = parseReadingField(targetReading);
  const userHira = katakanaToHiragana(userClean);
  const userKata = hiraganaToKatakana(userClean);
  const userFromRomaji = romajiToHiragana(userClean);
  
  const candidates = [userClean, userHira, userKata, userFromRomaji];

  return parsed.acceptableAnswers.some(ans => 
    candidates.some(cand => cand === ans || cand.toLowerCase() === ans.toLowerCase())
  );
}

// Speak text using Web Speech API
export function speakJapanese(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  
  // Cancel previous speech to prevent backlog
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.88; // Natural, clear speed
  
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
  if (jaVoice) {
    utterance.voice = jaVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}
