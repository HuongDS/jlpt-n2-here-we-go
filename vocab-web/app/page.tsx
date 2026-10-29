"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { VOCAB_LIST, VocabItem } from "@/data/vocabData";
import { checkReadingMatch, speakJapanese, parseReadingField } from "@/lib/japaneseUtils";
import { soundFX } from "@/lib/soundEffects";
import {
  Volume2,
  VolumeX,
  Star,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  BookOpen,
  List,
  Search,
  Eye,
  EyeOff,
  HelpCircle,
  Award,
  Sparkles,
  Smartphone,
  RefreshCw,
  Headphones,
  Maximize2,
  Minimize2
} from "lucide-react";

type FilterType = "all" | "correct_answers" | "starred" | "wrong";
type TabType = "quiz" | "list";
type StudyMode = "reading" | "listening"; // Nhìn từ gõ cách đọc VS Nghe đọc gõ lại (chính tả)

export default function VocabQuizApp() {
  const [tab, setTab] = useState<TabType>("quiz");
  const [filter, setFilter] = useState<FilterType>("all");
  const [studyMode, setStudyMode] = useState<StudyMode>("reading");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [checkedState, setCheckedState] = useState<{
    isChecked: boolean;
    isCorrect: boolean;
    revealed: boolean;
  }>({
    isChecked: false,
    isCorrect: false,
    revealed: false,
  });

  // Dynamic vocabulary list (synced from sheet or fallback)
  const [rawList, setRawList] = useState<VocabItem[]>(VOCAB_LIST);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>("");

  // Persistent user progress by Word Text (keeps progress 100% safe even when sheet adds new rows)
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);

  // Settings
  const [alwaysShowNotes, setAlwaysShowNotes] = useState<boolean>(true);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [hideReadingInTable, setHideReadingInTable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [tableExpanded, setTableExpanded] = useState<boolean>(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(true);

  useEffect(() => {
    setSoundEffectsEnabled(soundFX.enabled);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount & migrate old id-based storage to word-based storage
  useEffect(() => {
    try {
      // 1. Starred words
      const savedStarredWords = localStorage.getItem("n2_vocab_starred_words");
      if (savedStarredWords) {
        setStarredWords(JSON.parse(savedStarredWords));
      } else {
        const oldStarred = localStorage.getItem("n2_vocab_starred");
        if (oldStarred) {
          const ids: number[] = JSON.parse(oldStarred);
          const migrated = VOCAB_LIST.filter((i) => ids.includes(i.id)).map((i) => i.vocab);
          setStarredWords(migrated);
        }
      }

      // 2. Wrong words
      const savedWrongWords = localStorage.getItem("n2_vocab_wrong_words");
      if (savedWrongWords) {
        setWrongWords(JSON.parse(savedWrongWords));
      } else {
        const oldWrong = localStorage.getItem("n2_vocab_wrong");
        if (oldWrong) {
          const ids: number[] = JSON.parse(oldWrong);
          const migrated = VOCAB_LIST.filter((i) => ids.includes(i.id)).map((i) => i.vocab);
          setWrongWords(migrated);
        }
      }

      // 3. Correct words
      const savedCorrectWords = localStorage.getItem("n2_vocab_correct_words");
      if (savedCorrectWords) {
        setCorrectWords(JSON.parse(savedCorrectWords));
      } else {
        const oldCorrect = localStorage.getItem("n2_vocab_correct");
        if (oldCorrect) {
          const ids: number[] = JSON.parse(oldCorrect);
          const migrated = VOCAB_LIST.filter((i) => ids.includes(i.id)).map((i) => i.vocab);
          setCorrectWords(migrated);
        }
      }

      // 4. Settings
      const savedAlwaysNotes = localStorage.getItem("n2_always_notes");
      if (savedAlwaysNotes !== null) setAlwaysShowNotes(JSON.parse(savedAlwaysNotes));

      const savedAutoSpeak = localStorage.getItem("n2_auto_speak");
      if (savedAutoSpeak !== null) setAutoSpeak(JSON.parse(savedAutoSpeak));

      const savedTableExpanded = localStorage.getItem("n2_table_expanded");
      if (savedTableExpanded !== null) setTableExpanded(JSON.parse(savedTableExpanded));

      const savedStudyMode = localStorage.getItem("n2_study_mode");
      if (savedStudyMode === "reading" || savedStudyMode === "listening") {
        setStudyMode(savedStudyMode);
      }
    } catch {
      // ignore
    }

    // Auto sync from sheet on page load / reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchLatestVocab(false);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("n2_vocab_starred_words", JSON.stringify(starredWords));
    } catch {}
  }, [starredWords]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_vocab_wrong_words", JSON.stringify(wrongWords));
    } catch {}
  }, [wrongWords]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_vocab_correct_words", JSON.stringify(correctWords));
    } catch {}
  }, [correctWords]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_always_notes", JSON.stringify(alwaysShowNotes));
    } catch {}
  }, [alwaysShowNotes]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_auto_speak", JSON.stringify(autoSpeak));
    } catch {}
  }, [autoSpeak]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_study_mode", studyMode);
    } catch {}
  }, [studyMode]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_table_expanded", JSON.stringify(tableExpanded));
    } catch {}
  }, [tableExpanded]);

  // Sync function from sheet / API
  const fetchLatestVocab = async (isManual = false) => {
    setIsSyncing(true);
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const res = await fetch(`${basePath}/api/vocab?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        const prevCount = rawList.length;
        setRawList(data.items);
        const diff = data.items.length - prevCount;
        if (diff > 0) {
          setSyncMessage(`Đã đồng bộ: Nhận thêm +${diff} từ mới từ file sheet!`);
        } else if (isManual) {
          setSyncMessage(`Đã đồng bộ từ ${data.source} (${data.items.length} từ). Tiến trình được giữ nguyên.`);
        }
        setTimeout(() => setSyncMessage(""), 5000);
      }
    } catch (err) {
      console.error("Sync error:", err);
      if (isManual) {
        setSyncMessage("Không thể đồng bộ từ file sheet. Vẫn dùng dữ liệu hiện có.");
        setTimeout(() => setSyncMessage(""), 4000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered dataset
  const filteredList = useMemo(() => {
    let list = rawList;

    if (filter === "correct_answers") {
      list = list.filter((item) => item.isCorrect);
    } else if (filter === "starred") {
      list = list.filter((item) => starredWords.includes(item.vocab));
    } else if (filter === "wrong") {
      list = list.filter((item) => wrongWords.includes(item.vocab));
    }

    if (isShuffled && shuffledOrder.length === list.length) {
      return shuffledOrder.map((idx) => list[idx]);
    }

    return list;
  }, [rawList, filter, starredWords, wrongWords, isShuffled, shuffledOrder]);

  // Current item
  const currentItem: VocabItem | undefined = filteredList[currentIndex] || filteredList[0];

  // Auto focus and auto speak when item or mode changes
  useEffect(() => {
    setUserInput("");
    setCheckedState({
      isChecked: false,
      isCorrect: false,
      revealed: false,
    });

    if (tab === "quiz" && currentItem) {
      // In listening mode, immediately speak the word so user can listen and text it back
      if (studyMode === "listening") {
        const targetToSpeak =
          parseReadingField(currentItem.reading).primary || currentItem.vocab;
        speakJapanese(targetToSpeak);
      }

      // Auto-focus on desktop
      if (window.innerWidth >= 768) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    }
  }, [currentIndex, filter, isShuffled, tab, studyMode, currentItem]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= filteredList.length) {
      setCurrentIndex(0);
    }
  }, [filteredList.length, currentIndex]);

  const toggleStar = (vocabText: string) => {
    soundFX.playStar();
    setStarredWords((prev) =>
      prev.includes(vocabText)
        ? prev.filter((item) => item !== vocabText)
        : [...prev, vocabText]
    );
  };

  const playCurrentAudio = () => {
    if (!currentItem) return;
    const targetToSpeak =
      parseReadingField(currentItem.reading).primary || currentItem.vocab;
    speakJapanese(targetToSpeak);
  };

  const handleShuffle = () => {
    soundFX.playClick();
    if (!isShuffled) {
      const arr = Array.from({ length: filteredList.length }, (_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffledOrder(arr);
      setIsShuffled(true);
      setCurrentIndex(0);
    } else {
      setIsShuffled(false);
      setShuffledOrder([]);
      setCurrentIndex(0);
    }
  };

  const handleCheckAnswer = () => {
    if (!currentItem) return;
    if (!userInput.trim()) {
      inputRef.current?.focus();
      return;
    }

    // Matches against reading Kana, Romaji, and the Kanji vocab itself!
    const isMatch = checkReadingMatch(userInput, currentItem.reading, currentItem.vocab);
    setCheckedState({
      isChecked: true,
      isCorrect: isMatch,
      revealed: true,
    });

    // Phát âm lại từ đó dù đúng hay sai để người dùng đối chiếu âm thanh
    if (autoSpeak || studyMode === "listening") {
      const targetToSpeak =
        parseReadingField(currentItem.reading).primary || currentItem.vocab;
      speakJapanese(targetToSpeak);
    }

    if (isMatch) {
      soundFX.playCorrect();
      if (!correctWords.includes(currentItem.vocab)) {
        setCorrectWords((prev) => [...prev, currentItem.vocab]);
      }
      setWrongWords((prev) => prev.filter((v) => v !== currentItem.vocab));
    } else {
      soundFX.playWrong();
      if (!wrongWords.includes(currentItem.vocab)) {
        setWrongWords((prev) => [...prev, currentItem.vocab]);
      }
    }
  };

  const handleReveal = () => {
    soundFX.playReveal();
    if (!currentItem) return;
    setCheckedState({
      isChecked: true,
      isCorrect: false,
      revealed: true,
    });

    // Phát âm lại từ khi xem đáp án
    const targetToSpeak =
      parseReadingField(currentItem.reading).primary || currentItem.vocab;
    speakJapanese(targetToSpeak);

    if (!wrongWords.includes(currentItem.vocab)) {
      setWrongWords((prev) => [...prev, currentItem.vocab]);
    }
  };

  const handleNext = () => {
    soundFX.playNext();
    if (currentIndex < filteredList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    soundFX.playNext();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredList.length - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!checkedState.isChecked) {
        handleCheckAnswer();
      } else {
        handleNext();
      }
    }
  };

  // Filter for table view
  const tableDisplayList = useMemo(() => {
    if (!searchQuery.trim()) return filteredList;
    const q = searchQuery.toLowerCase().trim();
    return filteredList.filter(
      (item) =>
        item.vocab.toLowerCase().includes(q) ||
        item.reading.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
    );
  }, [filteredList, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fbfbfc] text-zinc-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className={`mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2 transition-all duration-200 ${tab === "list" ? (tableExpanded ? "max-w-[1600px] w-full px-4 sm:px-8" : "max-w-6xl w-full px-4 sm:px-6") : "max-w-4xl w-full"}`}>

          {/* Top row: Title, Sync Button, and Score Stats */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-zinc-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-tight shrink-0">
                N2
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-800 leading-tight">
                  TỪ VỰNG JLPT N2
                </h1>
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  Luyện gõ cách đọc & Chính tả nghe ({rawList.length} từ)
                </p>
              </div>
            </div>

            {/* Sync button & Quick stats */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => fetchLatestVocab(true)}
                disabled={isSyncing}
                title="Đồng bộ từ mới nhất từ file Sheet/Excel"
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded-md border border-zinc-200 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-zinc-600 ${
                    isSyncing ? "animate-spin text-zinc-800" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {isSyncing ? "Đang đồng bộ..." : "Đồng bộ sheet"}
                </span>
                <span className="sm:hidden">Sync</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                <span className="text-zinc-800 font-semibold" title="Số từ đã thuộc">
                  ✓ {correctWords.length}
                </span>
                <span className="text-zinc-300">/</span>
                <span className="text-zinc-500" title="Số từ cần ôn lại">
                  ✗ {wrongWords.length}
                </span>
              </div>
            </div>
          </div>

          {/* Sync notification message banner if any */}
          {syncMessage && (
            <div className="text-[11px] bg-zinc-100 border border-zinc-300 text-zinc-800 px-3 py-1.5 rounded-md text-center transition-all animate-in fade-in">
              {syncMessage}
            </div>
          )}

          {/* Main Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-zinc-100 p-0.5 sm:p-1 rounded-lg border border-zinc-200 text-xs">
            <button
              onClick={() => setTab("quiz")}
              className={`flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-md font-medium transition-all ${
                tab === "quiz"
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Ôn tập & Luyện gõ</span>
            </button>
            <button
              onClick={() => setTab("list")}
              className={`flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-md font-medium transition-all ${
                tab === "list"
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              <List className="w-3.5 h-3.5 shrink-0" />
              <span>Tra cứu & Ghi chú</span>
            </button>
          </div>
        </div>

        {/* Filter Bar with Smooth Mobile Horizontal Scrolling */}
        <div className="bg-zinc-50 border-t border-zinc-200/80 px-3 sm:px-4 py-1.5">
          <div className={`mx-auto flex items-center justify-between gap-2 text-xs transition-all duration-200 ${tab === "list" ? (tableExpanded ? "max-w-[1600px] w-full px-4 sm:px-8" : "max-w-6xl w-full px-4 sm:px-6") : "max-w-4xl w-full"}`}>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 shrink">
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentIndex(0);
                }}
                className={`whitespace-nowrap px-2.5 py-1 rounded text-[11px] sm:text-xs border transition-colors shrink-0 ${
                  filter === "all"
                    ? "bg-zinc-700 text-white border-zinc-700 font-medium"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                Tất cả ({rawList.length})
              </button>
              <button
                onClick={() => {
                  setFilter("correct_answers");
                  setCurrentIndex(0);
                }}
                className={`whitespace-nowrap px-2.5 py-1 rounded text-[11px] sm:text-xs border transition-colors flex items-center gap-1 shrink-0 ${
                  filter === "correct_answers"
                    ? "bg-zinc-700 text-white border-zinc-700 font-medium"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Award className="w-3 h-3 text-zinc-400" />
                Đáp án đề ({rawList.filter((i) => i.isCorrect).length})
              </button>
              <button
                onClick={() => {
                  setFilter("starred");
                  setCurrentIndex(0);
                }}
                className={`whitespace-nowrap px-2.5 py-1 rounded text-[11px] sm:text-xs border transition-colors flex items-center gap-1 shrink-0 ${
                  filter === "starred"
                    ? "bg-zinc-700 text-white border-zinc-700 font-medium"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Star className="w-3 h-3 fill-zinc-400 text-zinc-400" />
                Đánh dấu ({starredWords.length})
              </button>
              <button
                onClick={() => {
                  setFilter("wrong");
                  setCurrentIndex(0);
                }}
                className={`whitespace-nowrap px-2.5 py-1 rounded text-[11px] sm:text-xs border transition-colors flex items-center gap-1 shrink-0 ${
                  filter === "wrong"
                    ? "bg-zinc-700 text-white border-zinc-700 font-medium"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <X className="w-3 h-3 text-zinc-400" />
                Ôn lại ({wrongWords.length})
              </button>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={handleShuffle}
                title="Xáo trộn thứ tự từ vựng"
                className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] sm:text-xs transition-colors ${
                  isShuffled
                    ? "bg-zinc-700 text-white border-zinc-700 font-medium"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Shuffle className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {isShuffled ? "Đang xáo" : "Xáo trộn"}
                </span>
              </button>
              <button
                onClick={() => {
                  if (confirm("Đặt lại kết quả ôn tập (tiến độ đúng/sai)? Danh sách sao và từ vựng sẽ không bị xóa.")) {
                    setCorrectWords([]);
                    setWrongWords([]);
                    setCurrentIndex(0);
                  }
                }}
                title="Đặt lại thống kê đúng/sai"
                className="flex items-center gap-1 px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 text-[11px] sm:text-xs"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto p-3 sm:p-6 flex flex-col justify-start transition-all duration-200 ${tab === "list" ? (tableExpanded ? "max-w-[1600px] px-3 sm:px-8" : "max-w-6xl px-3 sm:px-6") : "max-w-4xl"}`}>

        {filteredList.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 text-center my-8 max-w-md mx-auto shadow-sm">
            <p className="text-zinc-500 text-sm mb-3">
              Không có từ vựng nào trong mục này.
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setCurrentIndex(0);
              }}
              className="px-4 py-2 bg-zinc-700 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition"
            >
              Quay lại xem Tất cả từ vựng
            </button>
          </div>
        ) : tab === "quiz" && currentItem ? (
          /* QUIZ PRACTICE MODE */
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* STUDY METHOD TOGGLE: Nhìn từ gõ cách đọc VS Nghe đọc gõ lại (Text lại) */}
            <div className="flex items-center justify-center">
              <div className="inline-flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
                <button
                  onClick={() => setStudyMode("reading")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                    studyMode === "reading"
                      ? "bg-white text-zinc-800 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Nhìn từ gõ cách đọc</span>
                </button>
                <button
                  onClick={() => {
                    setStudyMode("listening");
                    playCurrentAudio();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                    studyMode === "listening"
                      ? "bg-white text-zinc-800 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Bạn đọc tôi gõ lại (Nghe chép)</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Indicators */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-800">
                  Câu {currentIndex + 1} / {filteredList.length}
                </span>
                <span className="text-zinc-300">•</span>
                <span>(STT gốc #{currentItem.id})</span>
              </div>
              <div className="text-zinc-400 font-mono">
                {Math.round(((currentIndex + 1) / filteredList.length) * 100)}%
              </div>
            </div>

            {/* Thin minimalist progress bar */}
            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-zinc-600 h-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / filteredList.length) * 100}%`,
                }}
              />
            </div>

            {/* Main Word Card */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-8 shadow-sm flex flex-col items-center relative">
              {/* Card top toolbar */}
              <div className="w-full flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-1.5">
                  {currentItem.isCorrect && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full border border-zinc-200">
                      <Sparkles className="w-3 h-3 text-zinc-500" />
                      Đáp án đúng N2
                    </span>
                  )}
                  {studyMode === "listening" && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium bg-zinc-700 text-white px-2 py-0.5 rounded-full">
                      <Headphones className="w-3 h-3" />
                      Chính tả nghe
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* Sound FX toggle */}
                  <button
                    onClick={() => {
                      const nextVal = soundFX.toggle();
                      setSoundEffectsEnabled(nextVal);
                    }}
                    title={
                      soundEffectsEnabled
                        ? "Âm thanh hiệu ứng gõ phím & kiểm tra đang BẬT"
                        : "Âm thanh hiệu ứng đang TẮT"
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition min-h-[32px] ${
                      soundEffectsEnabled
                        ? "bg-zinc-100 text-zinc-800 border-zinc-300 font-medium"
                        : "bg-white text-zinc-400 border-zinc-200"
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${soundEffectsEnabled ? "text-amber-500" : "text-zinc-400"} shrink-0`} />
                    <span className="hidden sm:inline">Hiệu ứng:</span>
                    <span>{soundEffectsEnabled ? "Bật" : "Tắt"}</span>
                  </button>

                  {/* Auto speech toggle */}
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    title={
                      autoSpeak
                        ? "Đang bật tự động đọc sau khi nhập"
                        : "Đang tắt tự động đọc"
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition min-h-[32px] ${
                      autoSpeak
                        ? "bg-zinc-100 text-zinc-800 border-zinc-300 font-medium"
                        : "bg-white text-zinc-400 border-zinc-200"
                    }`}
                  >
                    {autoSpeak ? (
                      <Volume2 className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                    <span className="hidden sm:inline">Tự đọc:</span>
                    <span>{autoSpeak ? "Bật" : "Tắt"}</span>
                  </button>

                  {/* Manual speech button */}
                  <button
                    onClick={playCurrentAudio}
                    title="Bấm để nghe phát âm ngay"
                    className="p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Star / Bookmark button */}
                  <button
                    onClick={() => toggleStar(currentItem.vocab)}
                    title="Đánh dấu từ cần lưu ý"
                    className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        starredWords.includes(currentItem.vocab)
                          ? "fill-zinc-800 text-zinc-800"
                          : "text-zinc-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* VOCABULARY DISPLAY AREA (Differs by StudyMode) */}
              {studyMode === "reading" ? (
                /* CHẾ ĐỘ 1: NHÌN TỪ GÕ CÁCH ĐỌC */
                <div className="my-2 sm:my-4 text-center px-2 w-full">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
                    Từ vựng tiếng Nhật
                  </span>
                  <div className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-800 select-all break-words leading-tight">
                    {currentItem.vocab}
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ 2: BẠN ĐỌC TÔI GÕ LẠI (CHÍNH TẢ NGHE) */
                <div className="my-2 sm:my-4 text-center px-2 w-full flex flex-col items-center">
                  {!checkedState.revealed ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                        Đang đọc phát âm • Hãy nghe và gõ lại từ này
                      </span>
                      <button
                        onClick={playCurrentAudio}
                        className="group my-2 flex items-center gap-2.5 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200 rounded-xl transition shadow-sm"
                      >
                        <Volume2 className="w-5 h-5 text-zinc-800 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-zinc-800">
                          Bấm để nghe lại
                        </span>
                      </button>
                      <div className="text-lg font-mono tracking-widest text-zinc-300 select-none">
                        [ • • • • • • ]
                      </div>
                    </div>
                  ) : (
                    /* Revealed after input */
                    <div className="text-center animate-in fade-in">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
                        Từ vựng bạn vừa nghe:
                      </span>
                      <div className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-800 select-all break-words leading-tight">
                        {currentItem.vocab}
                      </div>
                      <div className="text-base font-semibold text-zinc-700 mt-1 font-mono">
                        【 {currentItem.reading} 】
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input for Reading or Dictation Text */}
              <div className="w-full max-w-md mt-4 sm:mt-6">
                <label className="block text-[11px] sm:text-xs font-medium text-zinc-500 mb-1.5 text-center">
                  {studyMode === "listening"
                    ? "Gõ lại từ bạn vừa nghe (Kanji, Hiragana, Katakana hoặc Romaji):"
                    : "Nhập cách đọc (Hiragana, Katakana hoặc Romaji):"}
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                      setUserInput(e.target.value);
                      soundFX.playTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={checkedState.isChecked && checkedState.isCorrect}
                    placeholder={
                      studyMode === "listening"
                        ? "Gõ lại từ bạn vừa nghe được..."
                        : "Ví dụ: おそくとも hoặc osokutomo..."
                    }
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    className={`w-full px-3.5 py-3 text-center text-base sm:text-xl font-medium rounded-lg border outline-none transition-all ${
                      checkedState.isChecked
                        ? checkedState.isCorrect
                          ? "border-zinc-800 bg-zinc-50 text-zinc-800"
                          : "border-zinc-400 bg-zinc-50 text-zinc-800"
                        : "border-zinc-300 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 bg-white"
                    }`}
                  />
                </div>

                {/* Submit and action buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {!checkedState.isChecked ? (
                    <>
                      <button
                        onClick={handleCheckAnswer}
                        className="flex-1 py-3 px-4 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 text-white font-medium text-sm rounded-lg transition shadow-sm min-h-[44px] flex items-center justify-center"
                      >
                        Kiểm tra (Enter)
                      </button>
                      <button
                        onClick={handleReveal}
                        title="Xem đáp án nếu bạn chưa nghe rõ"
                        className="py-3 px-3.5 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-700 text-sm font-medium rounded-lg border border-zinc-200 transition min-h-[44px] shrink-0"
                      >
                        Xem đáp án
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-4 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 text-white font-medium text-sm rounded-lg transition shadow-sm min-h-[44px] flex items-center justify-center"
                      >
                        Từ tiếp theo →
                      </button>
                      {!checkedState.isCorrect && (
                        <button
                          onClick={() => {
                            setCheckedState({
                              isChecked: false,
                              isCorrect: false,
                              revealed: false,
                            });
                            setUserInput("");
                            inputRef.current?.focus();
                          }}
                          className="py-3 px-3.5 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-700 text-sm font-medium rounded-lg border border-zinc-200 transition min-h-[44px] shrink-0"
                        >
                          Thử lại
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Feedback Banner if checked */}
                {checkedState.isChecked && (
                  <div
                    className={`mt-3 sm:mt-4 p-4 rounded-xl border transition-all shadow-sm ${
                      checkedState.isCorrect
                        ? "bg-emerald-50/70 border-emerald-300/80 text-emerald-950"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 font-bold text-sm sm:text-base mb-2">
                      {checkedState.isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold border border-emerald-200">
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>Chính xác! Bạn đã gõ đúng!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-semibold border border-amber-200">
                          <X className="w-4 h-4 text-amber-700" />
                          <span>Chưa chính xác (hoặc đã xem đáp án)</span>
                        </span>
                      )}
                    </div>

                    <div className="text-center mb-3">
                      <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                        {currentItem.vocab}
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-zinc-700 font-mono mt-0.5">
                        【 {currentItem.reading} 】
                      </div>
                    </div>

                    {/* HIỂN THỊ NGHĨA TIẾNG VIỆT SAU KHI NHẬP XONG */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-zinc-200/90 shadow-sm text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1">
                        <BookOpen className="w-4 h-4 text-zinc-700" />
                        <span>Nghĩa tiếng Việt:</span>
                      </div>
                      <div className="text-base sm:text-xl font-bold text-zinc-900 leading-snug">
                        {currentItem.meaning}
                      </div>

                      {currentItem.example && (
                        <div className="mt-2.5 pt-2.5 border-t border-zinc-150 text-xs sm:text-sm text-zinc-700">
                          <span className="font-semibold text-zinc-800">Ví dụ: </span>
                          <span className="text-zinc-800 font-medium">{currentItem.example}</span>
                        </div>
                      )}

                      {currentItem.notes && (
                        <div className="mt-2 text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-200">
                          <span className="font-semibold text-zinc-800">Ghi chú: </span>
                          <span>{currentItem.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PHẦN HIỂN THỊ GHI CHÚ ĐẶC ĐIỂM (EMPHASIZED) */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-150 pb-2.5 sm:pb-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-zinc-700 shrink-0" />
                  <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-800">
                    Ghi chú & Đặc điểm nhận biết
                  </h2>
                </div>
                <button
                  onClick={() => setAlwaysShowNotes(!alwaysShowNotes)}
                  className="text-[11px] sm:text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition py-1 px-1.5"
                >
                  {alwaysShowNotes ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Luôn mở
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Ẩn khi học
                    </>
                  )}
                </button>
              </div>

              {alwaysShowNotes || checkedState.revealed ? (
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                  {/* Ghi chú điểm ngữ pháp / collocation */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 sm:p-3.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                      Đặc điểm trọng tâm (Ghi chú):
                    </span>
                    <p className="text-zinc-800 font-medium leading-relaxed">
                      {currentItem.notes || "Không có ghi chú thêm."}
                    </p>
                  </div>

                  {/* Ý nghĩa tiếng Việt & Cách đọc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="border border-zinc-200 rounded-lg p-3 bg-white">
                      <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-0.5">
                        Ý nghĩa tiếng Việt:
                      </span>
                      <p className="text-zinc-800 font-medium">
                        {currentItem.meaning}
                      </p>
                    </div>

                    <div className="border border-zinc-200 rounded-lg p-3 bg-white">
                      <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-0.5">
                        Cách đọc:
                      </span>
                      <p className="text-zinc-800 font-medium">
                        {alwaysShowNotes && !checkedState.isChecked && studyMode === "reading" ? (
                          <span className="text-zinc-400 italic font-normal text-xs">
                            (Hãy nhập ở ô trên để luyện tập)
                          </span>
                        ) : alwaysShowNotes && !checkedState.isChecked && studyMode === "listening" ? (
                          <span className="text-zinc-400 italic font-normal text-xs">
                            (Hãy nghe và tự gõ lại)
                          </span>
                        ) : (
                          currentItem.reading
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Ví dụ minh họa */}
                  {currentItem.example && (
                    <div className="border border-zinc-200 rounded-lg p-3 bg-white">
                      <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-0.5">
                        Ví dụ minh họa:
                      </span>
                      <p className="text-zinc-800 italic leading-relaxed">
                        {currentItem.example}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                  <p className="text-xs text-zinc-500 mb-2">
                    Ghi chú tạm ẩn để bạn tự nhớ lại.
                  </p>
                  <button
                    onClick={() =>
                      setCheckedState((prev) => ({ ...prev, revealed: true }))
                    }
                    className="text-xs px-3 py-1.5 bg-white border border-zinc-300 rounded-md text-zinc-700 hover:bg-zinc-100 min-h-[32px]"
                  >
                    Mở ghi chú & gợi ý
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Navigation Toolbar */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={handlePrev}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-medium text-zinc-700 hover:text-zinc-800 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 transition min-h-[40px]"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Từ trước</span>
              </button>

              <div className="hidden sm:block text-xs text-zinc-400 text-center">
                Mẹo: Bạn có thể gõ Romaji hoặc Hiragana và nhấn Enter.
              </div>

              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-medium text-zinc-700 hover:text-zinc-800 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 transition min-h-[40px]"
              >
                <span>Từ sau</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        ) : (
          /* TABLE & CARD LIST VIEW MODE - RESPONSIVE */
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table controls bar */}
            <div className="p-3 sm:p-4 border-b border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-zinc-50">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm từ vựng, cách đọc, ý nghĩa, ghi chú..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <button
                  onClick={() => setTableExpanded(!tableExpanded)}
                  title={tableExpanded ? "Thu gọn kích thước vừa phải" : "Mở rộng bảng toàn màn hình"}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-300 bg-white rounded-lg text-zinc-700 hover:bg-zinc-100 transition min-h-[34px]"
                >
                  {tableExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Thu gọn</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Mở rộng toàn màn hình</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setHideReadingInTable(!hideReadingInTable)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-300 bg-white rounded-lg text-zinc-700 hover:bg-zinc-100 transition min-h-[34px]"
                >
                  {hideReadingInTable ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Hiện cách đọc
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Ẩn cách đọc
                    </>
                  )}
                </button>
                <div className="text-xs text-zinc-500 font-mono">
                  {tableDisplayList.length} từ
                </div>
              </div>
            </div>

            {/* 1. MOBILE VIEW: Responsive Card List (< md screens) */}
            <div className="block md:hidden divide-y divide-zinc-200">
              {tableDisplayList.map((item) => {
                const isStarred = starredWords.includes(item.vocab);
                return (
                  <div key={item.id} className="p-3.5 space-y-2 hover:bg-zinc-50/60 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                          #{item.id}
                        </span>
                        <span className="text-base font-bold text-zinc-800 select-all">
                          {item.vocab}
                        </span>
                        <button
                          onClick={() => {
                            const targetToSpeak =
                              parseReadingField(item.reading).primary || item.vocab;
                            speakJapanese(targetToSpeak);
                          }}
                          title="Nghe phát âm"
                          className="p-1 text-zinc-400 hover:text-zinc-800"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.isCorrect && (
                          <span className="text-[10px] text-zinc-600 bg-zinc-200/80 px-1.5 py-0.5 rounded font-normal">
                            Đáp án N2
                          </span>
                        )}
                        <button
                          onClick={() => toggleStar(item.vocab)}
                          className="p-1 text-zinc-300 hover:text-zinc-800"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isStarred ? "fill-zinc-800 text-zinc-800" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-50 p-2 rounded border border-zinc-150">
                        <span className="text-[10px] text-zinc-400 uppercase block mb-0.5">
                          Cách đọc:
                        </span>
                        {hideReadingInTable ? (
                          <span className="text-zinc-300 italic select-none">[Đã ẩn]</span>
                        ) : (
                          <span className="font-semibold text-zinc-800 font-mono">
                            {item.reading}
                          </span>
                        )}
                      </div>
                      <div className="bg-zinc-50 p-2 rounded border border-zinc-150">
                        <span className="text-[10px] text-zinc-400 uppercase block mb-0.5">
                          Ý nghĩa:
                        </span>
                        <span className="font-medium text-zinc-800">
                          {item.meaning}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs bg-zinc-100/70 p-2.5 rounded border border-zinc-200">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase block mb-0.5">
                        Ghi chú đặc điểm:
                      </span>
                      <p className="text-zinc-800 leading-relaxed font-normal">
                        {item.notes}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <p className="text-[11px] text-zinc-500 italic truncate flex-1">
                        {item.example}
                      </p>
                      <button
                        onClick={() => {
                          const foundIdx = filteredList.findIndex((x) => x.id === item.id);
                          if (foundIdx !== -1) setCurrentIndex(foundIdx);
                          setTab("quiz");
                        }}
                        className="px-2.5 py-1 bg-zinc-700 text-white text-[11px] font-medium rounded hover:bg-zinc-800 shrink-0 min-h-[30px]"
                      >
                        Luyện gõ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP VIEW: Full Data Table (>= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-100 text-zinc-600 font-semibold uppercase tracking-wider">
                    <th className="p-3.5 w-14 text-center">STT</th>
                    <th className="p-3.5 min-w-[160px] whitespace-nowrap">Từ vựng</th>
                    <th className="p-3.5 min-w-[160px] whitespace-nowrap">Cách đọc</th>
                    <th className="p-3.5 min-w-[200px]">Ý nghĩa</th>
                    <th className="p-3.5 min-w-[320px]">Ghi chú đặc điểm</th>
                    <th className="p-3.5 min-w-[320px]">Ví dụ minh họa</th>
                    <th className="p-3.5 w-24 text-center">Ôn tập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {tableDisplayList.map((item) => {
                    const isStarred = starredWords.includes(item.vocab);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-zinc-50 transition-colors ${
                          item.isCorrect ? "bg-zinc-50/50" : ""
                        }`}
                      >
                        <td className="p-3 text-center text-zinc-400 font-mono">
                          <div className="flex flex-col items-center gap-1">
                            <span>{item.id}</span>
                            <button
                              onClick={() => toggleStar(item.vocab)}
                              className="text-zinc-300 hover:text-zinc-700"
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  isStarred ? "fill-zinc-800 text-zinc-800" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap min-w-[160px]">
                          <div className="flex items-center gap-2 font-bold text-base text-zinc-800 select-all">
                            <span>{item.vocab}</span>
                            <button
                              onClick={() => {
                                const targetToSpeak =
                                  parseReadingField(item.reading).primary || item.vocab;
                                speakJapanese(targetToSpeak);
                              }}
                              title="Nghe phát âm"
                              className="text-zinc-400 hover:text-zinc-800"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.isCorrect && (
                            <span className="text-[10px] text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded font-normal inline-block mt-1">
                              Đề thi N2
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap min-w-[160px]">
                          {hideReadingInTable ? (
                            <span className="text-zinc-300 italic select-none">
                              [Đã ẩn]
                            </span>
                          ) : (
                            <span className="font-semibold text-zinc-700 font-mono text-sm">
                              {item.reading}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 min-w-[200px] text-zinc-800 font-medium leading-relaxed">
                          {item.meaning}
                        </td>

                        <td className="p-3.5 min-w-[320px] text-zinc-700 bg-zinc-50/70 leading-relaxed">
                          {item.notes}
                        </td>

                        <td className="p-3.5 min-w-[320px] text-zinc-600 italic leading-relaxed">
                          {item.example}
                        </td>

                        <td className="p-3.5 w-24 text-center">
                          <button
                            onClick={() => {
                              const foundIdx = filteredList.findIndex(
                                (x) => x.id === item.id
                              );
                              if (foundIdx !== -1) setCurrentIndex(foundIdx);
                              setTab("quiz");
                            }}
                            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-700 hover:text-white text-zinc-700 text-[11px] rounded border border-zinc-200 transition"
                          >
                            Luyện gõ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-3 sm:py-4 mt-6 text-center text-[11px] sm:text-xs text-zinc-400 px-4">
        <div className="max-w-md mx-auto flex items-center justify-center gap-1.5 text-zinc-500 mb-1">
          <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
          <span>Học trên điện thoại (cùng Wi-Fi):</span>
          <span className="font-mono font-medium text-zinc-800 select-all">
            http://192.168.1.233:3000
          </span>
        </div>
        <p>Bộ từ vựng ôn tập JLPT N2 • 2 chế độ: Luyện gõ cách đọc & Chính tả nghe</p>
      </footer>
    </div>
  );
}
