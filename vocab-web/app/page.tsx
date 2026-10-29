"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { VOCAB_LIST, VocabItem } from "@/data/vocabData";
import { checkReadingMatch, speakJapanese, parseReadingField } from "@/lib/japaneseUtils";
import { soundFX, triggerHaptic } from "@/lib/soundEffects";
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
  Minimize2,
  Gamepad2,
  Flame,
  Zap,
  Timer,
  Trophy,
  Volume1
} from "lucide-react";

type FilterType = "all" | "correct_answers" | "starred" | "wrong";
type TabType = "quiz" | "match" | "speed" | "list";
type StudyMode = "reading" | "listening";

interface MatchCard {
  id: string;
  wordId: number;
  text: string;
  type: "word" | "reading" | "meaning";
  matched: boolean;
}

export default function VocabQuizApp() {
  // Navigation & Modes
  const [tab, setTab] = useState<TabType>("quiz");
  const [filter, setFilter] = useState<FilterType>("all");
  const [studyMode, setStudyMode] = useState<StudyMode>("reading");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Quiz state
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

  // Dynamic vocab list & sync
  const [rawList, setRawList] = useState<VocabItem[]>(VOCAB_LIST);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>("");

  // Persistent user learning progress
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);

  // Gamification: Streaks, XP, Best Records
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [showStreakCelebration, setShowStreakCelebration] = useState<boolean>(false);

  // Settings
  const [alwaysShowNotes, setAlwaysShowNotes] = useState<boolean>(true);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hideReadingInTable, setHideReadingInTable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [tableExpanded, setTableExpanded] = useState<boolean>(true);

  // Jump to question modal
  const [isJumpModalOpen, setIsJumpModalOpen] = useState<boolean>(false);
  const [jumpInput, setJumpInput] = useState<string>("");

  // --- GAME 1: MATCH PAIRS (GHÉP THẺ) STATE ---
  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchCard[]>([]);
  const [matchPairsCleared, setMatchPairsCleared] = useState<number>(0);
  const [matchTimer, setMatchTimer] = useState<number>(0);
  const [isMatchRunning, setIsMatchRunning] = useState<boolean>(false);
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const [matchBestTime, setMatchBestTime] = useState<number | null>(null);
  const [matchModeType, setMatchModeType] = useState<"reading" | "meaning">("reading");

  // --- GAME 2: SPEED RUN 60S (ĐUA TỐC ĐỘ) STATE ---
  const [speedScore, setSpeedScore] = useState<number>(0);
  const [speedHighScore, setSpeedHighScore] = useState<number>(0);
  const [speedTimeLeft, setSpeedTimeLeft] = useState<number>(60);
  const [isSpeedRunning, setIsSpeedRunning] = useState<boolean>(false);
  const [isSpeedFinished, setIsSpeedFinished] = useState<boolean>(false);
  const [speedCurrentWord, setSpeedCurrentWord] = useState<VocabItem | null>(null);
  const [speedOptions, setSpeedOptions] = useState<string[]>([]);
  const [speedFeedback, setSpeedFeedback] = useState<"correct" | "wrong" | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const matchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. FULL STATE RESTORATION ON MOUNT (FIXES MOBILE RELOAD ISSUE COMPLETELY)
  useEffect(() => {
    try {
      // Restore Index & Filter so reloading phone never restarts from 0
      const savedIndex = localStorage.getItem("n2_current_index");
      if (savedIndex !== null) setCurrentIndex(Math.max(0, Number(savedIndex)));

      const savedFilter = localStorage.getItem("n2_current_filter");
      if (savedFilter) setFilter(savedFilter as FilterType);

      const savedTab = localStorage.getItem("n2_current_tab");
      if (savedTab && ["quiz", "match", "speed", "list"].includes(savedTab)) {
        setTab(savedTab as TabType);
      }

      // Starred, wrong, correct words
      const savedStarred = localStorage.getItem("n2_vocab_starred_words");
      if (savedStarred) setStarredWords(JSON.parse(savedStarred));

      const savedWrong = localStorage.getItem("n2_vocab_wrong_words");
      if (savedWrong) setWrongWords(JSON.parse(savedWrong));

      const savedCorrect = localStorage.getItem("n2_vocab_correct_words");
      if (savedCorrect) setCorrectWords(JSON.parse(savedCorrect));

      // Gamification
      const savedStreak = localStorage.getItem("n2_current_streak");
      if (savedStreak !== null) setCurrentStreak(Number(savedStreak));

      const savedBestStreak = localStorage.getItem("n2_best_streak");
      if (savedBestStreak !== null) setBestStreak(Number(savedBestStreak));

      const savedXP = localStorage.getItem("n2_total_xp");
      if (savedXP !== null) setTotalXP(Number(savedXP));

      const savedMatchBest = localStorage.getItem("n2_match_best_time");
      if (savedMatchBest !== null) setMatchBestTime(Number(savedMatchBest));

      const savedSpeedHigh = localStorage.getItem("n2_speed_high_score");
      if (savedSpeedHigh !== null) setSpeedHighScore(Number(savedSpeedHigh));

      // Settings
      const savedAlwaysNotes = localStorage.getItem("n2_always_notes");
      if (savedAlwaysNotes !== null) setAlwaysShowNotes(JSON.parse(savedAlwaysNotes));

      const savedAutoSpeak = localStorage.getItem("n2_auto_speak");
      if (savedAutoSpeak !== null) setAutoSpeak(JSON.parse(savedAutoSpeak));

      const savedStudyMode = localStorage.getItem("n2_study_mode");
      if (savedStudyMode === "reading" || savedStudyMode === "listening") {
        setStudyMode(savedStudyMode);
      }

      const savedTableExpanded = localStorage.getItem("n2_table_expanded");
      if (savedTableExpanded !== null) setTableExpanded(JSON.parse(savedTableExpanded));

      setSoundEnabled(soundFX.enabled);
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
      localStorage.setItem("n2_current_index", String(currentIndex));
    } catch {}
  }, [currentIndex]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_current_filter", filter);
    } catch {}
  }, [filter]);

  useEffect(() => {
    try {
      localStorage.setItem("n2_current_tab", tab);
    } catch {}
  }, [tab]);

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
      localStorage.setItem("n2_current_streak", String(currentStreak));
      localStorage.setItem("n2_best_streak", String(bestStreak));
      localStorage.setItem("n2_total_xp", String(totalXP));
    } catch {}
  }, [currentStreak, bestStreak, totalXP]);

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
      const res = await fetch(`/api/vocab?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        const prevCount = rawList.length;
        setRawList(data.items);
        const diff = data.items.length - prevCount;
        if (diff > 0) {
          setSyncMessage(`Đã đồng bộ: Nhận thêm +${diff} từ mới từ file sheet!`);
        } else if (isManual) {
          setSyncMessage(`Đã đồng bộ từ ${data.source} (${data.items.length} từ).`);
        }
        setTimeout(() => setSyncMessage(""), 5000);
      }
    } catch (err) {
      console.error("Sync error:", err);
      if (isManual) {
        setSyncMessage("Không thể đọc file sheet. Vẫn dùng dữ liệu hiện có.");
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

  const currentItem: VocabItem | undefined = filteredList[currentIndex] || filteredList[0];

  // Auto focus & audio on item change
  useEffect(() => {
    setUserInput("");
    setCheckedState({
      isChecked: false,
      isCorrect: false,
      revealed: false,
    });

    if (tab === "quiz" && currentItem) {
      if (studyMode === "listening") {
        const targetToSpeak =
          parseReadingField(currentItem.reading).primary || currentItem.vocab;
        speakJapanese(targetToSpeak);
      }
      if (window.innerWidth >= 768) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    }
  }, [currentIndex, filter, isShuffled, tab, studyMode, currentItem]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= filteredList.length && filteredList.length > 0) {
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

    const isMatch = checkReadingMatch(userInput, currentItem.reading, currentItem.vocab);
    setCheckedState({
      isChecked: true,
      isCorrect: isMatch,
      revealed: true,
    });

    if (isMatch) {
      soundFX.playCorrect();
      // Increase XP & Streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      // Streak celebration milestones (3, 5, 10, 20...)
      if (newStreak % 5 === 0 || newStreak === 3) {
        setShowStreakCelebration(true);
        setTimeout(() => setShowStreakCelebration(false), 2500);
      }

      const comboBonus = Math.min(newStreak * 2, 20);
      setTotalXP((prev) => prev + 10 + comboBonus);

      if (!correctWords.includes(currentItem.vocab)) {
        setCorrectWords((prev) => [...prev, currentItem.vocab]);
      }
      setWrongWords((prev) => prev.filter((v) => v !== currentItem.vocab));
    } else {
      soundFX.playWrong();
      setCurrentStreak(0);
      if (!wrongWords.includes(currentItem.vocab)) {
        setWrongWords((prev) => [...prev, currentItem.vocab]);
      }
    }

    // Auto read back
    if (autoSpeak || studyMode === "listening") {
      const targetToSpeak =
        parseReadingField(currentItem.reading).primary || currentItem.vocab;
      speakJapanese(targetToSpeak);
    }
  };

  const handleReveal = () => {
    if (!currentItem) return;
    soundFX.playReveal();
    setCurrentStreak(0);
    setCheckedState({
      isChecked: true,
      isCorrect: false,
      revealed: true,
    });

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
    soundFX.playTyping();
    if (e.key === "Enter") {
      e.preventDefault();
      if (!checkedState.isChecked) {
        handleCheckAnswer();
      } else {
        handleNext();
      }
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (targetNum: number) => {
    if (targetNum >= 1 && targetNum <= filteredList.length) {
      setCurrentIndex(targetNum - 1);
      setIsJumpModalOpen(false);
      setJumpInput("");
      soundFX.playClick();
    }
  };

  // Level & Rank title
  const userLevel = useMemo(() => {
    if (totalXP >= 1000) return { level: 5, title: "Bậc thầy JLPT", next: 2000 };
    if (totalXP >= 600) return { level: 4, title: "Chuyên gia N2", next: 1000 };
    if (totalXP >= 300) return { level: 3, title: "Thợ săn từ vựng", next: 600 };
    if (totalXP >= 100) return { level: 2, title: "Tập sự N2", next: 300 };
    return { level: 1, title: "Tân binh N2", next: 100 };
  }, [totalXP]);

  // ==========================================
  // GAME 1: MATCH PAIRS LOGIC (GHÉP THẺ TỐC ĐỘ)
  // ==========================================
  const startNewMatchGame = useCallback(() => {
    if (rawList.length < 4) return;
    soundFX.playClick();
    setIsMatchFinished(false);
    setSelectedCards([]);
    setMatchPairsCleared(0);
    setMatchTimer(0);
    setIsMatchRunning(true);

    // Pick 6 random words (or 4 on mobile)
    const count = window.innerWidth < 640 ? 4 : 6;
    const shuffled = [...rawList].sort(() => 0.5 - Math.random()).slice(0, count);

    const cards: MatchCard[] = [];
    shuffled.forEach((item) => {
      // Card A: Word (Kanji/Katakana)
      cards.push({
        id: `word-${item.id}`,
        wordId: item.id,
        text: item.vocab,
        type: "word",
        matched: false,
      });
      // Card B: Reading or Meaning
      const rightText =
        matchModeType === "reading"
          ? parseReadingField(item.reading).primary
          : item.meaning;
      cards.push({
        id: `target-${item.id}`,
        wordId: item.id,
        text: rightText,
        type: matchModeType,
        matched: false,
      });
    });

    // Shuffle cards
    setMatchCards(cards.sort(() => 0.5 - Math.random()));
  }, [rawList, matchModeType]);

  // Match game timer
  useEffect(() => {
    if (isMatchRunning && !isMatchFinished) {
      matchTimerRef.current = setInterval(() => {
        setMatchTimer((prev) => Number((prev + 0.1).toFixed(1)));
      }, 100);
    } else {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    }
    return () => {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    };
  }, [isMatchRunning, isMatchFinished]);

  // Handle card click
  const handleCardClick = (card: MatchCard) => {
    if (!isMatchRunning || isMatchFinished || card.matched) return;
    if (selectedCards.length === 1 && selectedCards[0].id === card.id) return;

    soundFX.playClick();
    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [cardA, cardB] = newSelected;
      if (cardA.wordId === cardB.wordId && cardA.type !== cardB.type) {
        // MATCH!
        soundFX.playMatch();
        triggerHaptic(30);
        setTotalXP((prev) => prev + 15);

        setMatchCards((prev) =>
          prev.map((c) =>
            c.wordId === cardA.wordId ? { ...c, matched: true } : c
          )
        );
        setSelectedCards([]);
        const nextCleared = matchPairsCleared + 1;
        setMatchPairsCleared(nextCleared);

        const totalPairs = matchCards.length / 2;
        if (nextCleared >= totalPairs) {
          // VICTORY!
          setIsMatchRunning(false);
          setIsMatchFinished(true);
          soundFX.playVictory();
          setTotalXP((prev) => prev + 50);

          if (matchBestTime === null || matchTimer < matchBestTime) {
            setMatchBestTime(matchTimer);
            localStorage.setItem("n2_match_best_time", String(matchTimer));
          }
        }
      } else {
        // MISMATCH!
        soundFX.playWrong();
        setTimeout(() => {
          setSelectedCards([]);
        }, 500);
      }
    }
  };

  // ==========================================
  // GAME 2: SPEED RUN 60S (ĐUA TỐC ĐỘ 60S)
  // ==========================================
  const nextSpeedQuestion = useCallback(() => {
    if (rawList.length < 4) return;
    const randomWord = rawList[Math.floor(Math.random() * rawList.length)];
    setSpeedCurrentWord(randomWord);

    // 1 correct answer + 3 distractors
    const correctAns = parseReadingField(randomWord.reading).primary;
    const distractors: string[] = [];
    const pool = rawList.filter((x) => x.id !== randomWord.id);

    while (distractors.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const dist = parseReadingField(pool[idx].reading).primary;
      if (dist !== correctAns && !distractors.includes(dist)) {
        distractors.push(dist);
      }
      pool.splice(idx, 1);
    }

    setSpeedOptions([...distractors, correctAns].sort(() => 0.5 - Math.random()));
    setSpeedFeedback(null);
  }, [rawList]);

  const startSpeedRun = () => {
    soundFX.playClick();
    setSpeedScore(0);
    setSpeedTimeLeft(60);
    setIsSpeedFinished(false);
    setIsSpeedRunning(true);
    nextSpeedQuestion();
  };

  // Speed timer countdown
  useEffect(() => {
    if (isSpeedRunning && !isSpeedFinished) {
      speedTimerRef.current = setInterval(() => {
        setSpeedTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(speedTimerRef.current!);
            setIsSpeedRunning(false);
            setIsSpeedFinished(true);
            soundFX.playVictory();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    }
    return () => {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    };
  }, [isSpeedRunning, isSpeedFinished]);

  // Handle speed answer
  const handleSpeedAnswer = (chosen: string) => {
    if (!speedCurrentWord || !isSpeedRunning) return;
    const correctAns = parseReadingField(speedCurrentWord.reading).primary;

    if (chosen === correctAns) {
      soundFX.playCorrect();
      setSpeedFeedback("correct");
      setSpeedScore((prev) => {
        const next = prev + 10;
        if (next > speedHighScore) {
          setSpeedHighScore(next);
          localStorage.setItem("n2_speed_high_score", String(next));
        }
        return next;
      });
      setTotalXP((prev) => prev + 5);
      // Small time bonus +1s
      setSpeedTimeLeft((t) => Math.min(60, t + 1));
      setTimeout(() => {
        nextSpeedQuestion();
      }, 250);
    } else {
      soundFX.playWrong();
      setSpeedFeedback("wrong");
      setTimeout(() => {
        nextSpeedQuestion();
      }, 500);
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
    <div className="min-h-screen bg-[#fbfbfc] text-zinc-800 flex flex-col font-sans select-none sm:select-auto">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div
          className={`mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-2 transition-all duration-200 ${
            tab === "list"
              ? tableExpanded
                ? "max-w-[1600px] w-full px-4 sm:px-8"
                : "max-w-6xl w-full px-4 sm:px-6"
              : "max-w-4xl w-full"
          }`}
        >
          {/* Top row: Logo, Level Badge, Streak, Sound Toggle, and Stats */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-zinc-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-tight shrink-0 shadow-sm">
                N2
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-800 leading-tight">
                    TỪ VỰNG JLPT N2
                  </h1>
                  {/* Level Badge */}
                  <span
                    title={`Tổng điểm kinh nghiệm: ${totalXP} XP`}
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full border border-zinc-200"
                  >
                    <Trophy className="w-2.5 h-2.5 text-zinc-600" />
                    <span>Lv.{userLevel.level}</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  {userLevel.title} • {totalXP} XP
                </p>
              </div>
            </div>

            {/* Quick stats, Streak & Sound tools */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Streak Pill */}
              <div
                title={`Chuỗi trả lời đúng hiện tại: ${currentStreak} (Kỷ lục: ${bestStreak})`}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition ${
                  currentStreak >= 3
                    ? "bg-zinc-800 text-white border-zinc-800"
                    : "bg-zinc-100 text-zinc-700 border-zinc-200"
                }`}
              >
                <Flame
                  className={`w-3.5 h-3.5 ${
                    currentStreak >= 3 ? "text-amber-400 fill-amber-400" : "text-zinc-400"
                  }`}
                />
                <span>{currentStreak}</span>
              </div>

              {/* Sound Effects Toggle */}
              <button
                onClick={() => {
                  const newState = soundFX.toggle();
                  setSoundEnabled(newState);
                }}
                title={soundEnabled ? "Âm thanh hiệu ứng: Bật" : "Âm thanh hiệu ứng: Tắt"}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border border-zinc-200 transition"
              >
                {soundEnabled ? (
                  <Volume1 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {/* Sync button */}
              <button
                onClick={() => fetchLatestVocab(true)}
                disabled={isSyncing}
                title="Đồng bộ từ mới nhất từ file Sheet/Excel"
                className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded-md border border-zinc-200 transition"
              >
                <RefreshCw
                  className={`w-3 h-3 text-zinc-600 ${
                    isSyncing ? "animate-spin text-zinc-700" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {isSyncing ? "Đang đồng bộ..." : "Sync"}
                </span>
              </button>

              {/* Score count */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200">
                <span className="text-zinc-800 font-semibold" title="Đã thuộc">
                  ✓ {correctWords.length}
                </span>
                <span className="text-zinc-300">/</span>
                <span className="text-zinc-500" title="Cần ôn">
                  ✗ {wrongWords.length}
                </span>
              </div>
            </div>
          </div>

          {/* Sync notification */}
          {syncMessage && (
            <div className="text-[11px] bg-zinc-100 border border-zinc-300 text-zinc-800 px-3 py-1.5 rounded-md text-center transition-all animate-in fade-in">
              {syncMessage}
            </div>
          )}

          {/* 4 Main Tabs: Luyện gõ, Game Ghép thẻ, Game Đua 60s, Tra cứu */}
          <div className="grid grid-cols-4 bg-zinc-100 p-0.5 sm:p-1 rounded-lg border border-zinc-200 text-[11px] sm:text-xs">
            <button
              onClick={() => {
                soundFX.playClick();
                setTab("quiz");
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 sm:px-3 rounded-md font-medium transition-all ${
                tab === "quiz"
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Luyện gõ</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setTab("match");
                if (matchCards.length === 0) startNewMatchGame();
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 sm:px-3 rounded-md font-medium transition-all ${
                tab === "match"
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ghép thẻ</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setTab("speed");
                if (!isSpeedRunning && !isSpeedFinished) startSpeedRun();
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 sm:px-3 rounded-md font-medium transition-all ${
                tab === "speed"
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Đua 60s</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setTab("list");
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 sm:px-3 rounded-md font-medium transition-all ${
                tab === "list"
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              <List className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Tra cứu</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Only shown in Quiz and List mode) */}
        {(tab === "quiz" || tab === "list") && (
          <div className="bg-zinc-50 border-t border-zinc-200/80 px-3 sm:px-4 py-1.5">
            <div
              className={`mx-auto flex items-center justify-between gap-2 text-xs transition-all duration-200 ${
                tab === "list"
                  ? tableExpanded
                    ? "max-w-[1600px] w-full px-4 sm:px-8"
                    : "max-w-6xl w-full px-4 sm:px-6"
                  : "max-w-4xl w-full"
              }`}
            >
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 shrink">
                <button
                  onClick={() => {
                    soundFX.playClick();
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
                    soundFX.playClick();
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
                    soundFX.playClick();
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
                    soundFX.playClick();
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

              {/* Tools: Shuffle & Reset */}
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
                    if (
                      confirm(
                        "Đặt lại kết quả ôn tập (tiến độ đúng/sai)? Danh sách sao và từ vựng sẽ không bị xóa."
                      )
                    ) {
                      setCorrectWords([]);
                      setWrongWords([]);
                      setCurrentStreak(0);
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
        )}
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full mx-auto p-3 sm:p-6 flex flex-col justify-start transition-all duration-200 ${
          tab === "list"
            ? tableExpanded
              ? "max-w-[1600px] px-3 sm:px-8"
              : "max-w-6xl px-3 sm:px-6"
            : "max-w-4xl"
        }`}
      >
        {/* ======================================================== */}
        {/* TAB 1: PRACTICE & QUIZ MODE (LUYỆN GÕ THÔNG MINH)        */}
        {/* ======================================================== */}
        {tab === "quiz" && (
          <>
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
            ) : currentItem ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Method Switch: Nhìn từ gõ cách đọc VS Nghe đọc gõ lại */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex bg-zinc-100 p-0.5 sm:p-1 rounded-lg border border-zinc-200 text-xs">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setStudyMode("reading");
                      }}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition ${
                        studyMode === "reading"
                          ? "bg-white text-zinc-800 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span className="sm:hidden">Nhìn từ gõ</span>
                      <span className="hidden sm:inline">Nhìn từ gõ cách đọc</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setStudyMode("listening");
                        playCurrentAudio();
                      }}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition ${
                        studyMode === "listening"
                          ? "bg-white text-zinc-800 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5 shrink-0" />
                      <span className="sm:hidden">Nghe gõ lại</span>
                      <span className="hidden sm:inline">Nghe đọc gõ lại (Chính tả)</span>
                    </button>
                  </div>
                </div>

                {/* Question Position, Jump to question & Streak Badge */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 px-0.5">
                  <div className="flex items-center gap-1.5">
                    {/* Clickable question number to jump anywhere */}
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setJumpInput(String(currentIndex + 1));
                        setIsJumpModalOpen(true);
                      }}
                      title="Bấm để nhảy đến câu bất kỳ"
                      className="font-semibold text-zinc-800 underline decoration-dotted underline-offset-2 hover:text-black flex items-center gap-0.5"
                    >
                      <span>Câu {currentIndex + 1} / {filteredList.length}</span>
                    </button>
                    <span className="text-zinc-300">•</span>
                    <span>(Gốc #{currentItem.id})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentStreak >= 2 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200 animate-pulse">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Combo x{currentStreak}</span>
                      </span>
                    )}
                    <span className="text-zinc-400 font-mono">
                      {Math.round(((currentIndex + 1) / filteredList.length) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-zinc-600 h-full transition-all duration-300"
                    style={{
                      width: `${((currentIndex + 1) / filteredList.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Main Word Card */}
                <div className="bg-white border border-zinc-200 rounded-xl p-3.5 sm:p-8 shadow-sm flex flex-col items-center relative">
                  {/* Streak milestone alert banner */}
                  {showStreakCelebration && (
                    <div className="absolute -top-3 bg-zinc-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tuyệt vời! Chuỗi {currentStreak} câu đúng liên tiếp!</span>
                    </div>
                  )}

                  {/* Card top toolbar */}
                  <div className="w-full flex items-center justify-between mb-2.5 sm:mb-4 gap-2">
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
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setAutoSpeak(!autoSpeak);
                        }}
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

                      <button
                        onClick={playCurrentAudio}
                        title="Bấm để nghe phát âm ngay"
                        className="p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

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

                  {/* Vocabulary Display */}
                  {studyMode === "reading" ? (
                    <div className="my-1.5 sm:my-4 text-center px-2 w-full">
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5 sm:mb-1">
                        Từ vựng tiếng Nhật
                      </span>
                      <div className="text-2xl sm:text-5xl font-bold tracking-tight text-zinc-800 select-all break-words leading-tight">
                        {currentItem.vocab}
                      </div>
                    </div>
                  ) : (
                    <div className="my-1.5 sm:my-4 text-center px-2 w-full flex flex-col items-center">
                      {!checkedState.revealed ? (
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 block">
                            Đang đọc phát âm • Hãy nghe và gõ lại
                          </span>
                          <button
                            onClick={playCurrentAudio}
                            className="group my-1.5 flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200 rounded-xl transition shadow-sm"
                          >
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-800 group-hover:scale-110 transition-transform" />
                            <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                              Bấm để nghe lại âm thanh
                            </span>
                          </button>
                          <div className="text-base sm:text-lg font-mono tracking-widest text-zinc-300 select-none">
                            [ • • • • • • ]
                          </div>
                        </div>
                      ) : (
                        <div className="text-center animate-in fade-in">
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
                            Từ vựng bạn vừa nghe:
                          </span>
                          <div className="text-2xl sm:text-5xl font-bold tracking-tight text-zinc-800 select-all break-words leading-tight">
                            {currentItem.vocab}
                          </div>
                          <div className="text-sm sm:text-base font-semibold text-zinc-700 mt-1 font-mono">
                            【 {currentItem.reading} 】
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input field */}
                  <div className="w-full max-w-md mt-2.5 sm:mt-5">
                    <label className="block text-[11px] sm:text-xs font-medium text-zinc-500 mb-1 text-center">
                      {studyMode === "listening"
                        ? "Gõ lại từ bạn vừa nghe (Kanji, Kana hoặc Romaji):"
                        : "Nhập cách đọc (Hiragana, Katakana hoặc Romaji):"}
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={checkedState.isChecked && checkedState.isCorrect}
                        placeholder={
                          studyMode === "listening"
                            ? "Gõ lại từ bạn vừa nghe..."
                            : "Ví dụ: おそくとも hoặc osokutomo..."
                        }
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck={false}
                        enterKeyHint="go"
                        className={`w-full px-3 py-2.5 sm:py-3 text-center text-base sm:text-xl font-medium rounded-lg border outline-none transition-all ${
                          checkedState.isChecked
                            ? checkedState.isCorrect
                              ? "border-zinc-700 bg-zinc-50 text-zinc-800"
                              : "border-zinc-400 bg-zinc-50 text-zinc-800"
                            : "border-zinc-300 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 bg-white"
                        }`}
                      />
                    </div>

                    {/* Action buttons */}
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
                            title="Xem đáp án nếu bạn chưa nhớ"
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
                                soundFX.playClick();
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

                    {/* Feedback Banner */}
                    {checkedState.isChecked && (
                      <div
                        className={`mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-lg border text-sm text-center transition-all ${
                          checkedState.isCorrect
                            ? "bg-zinc-100 border-zinc-300 text-zinc-800"
                            : "bg-zinc-50 border-zinc-300 text-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 font-semibold text-sm sm:text-base mb-1">
                          {checkedState.isCorrect ? (
                            <>
                              <Check className="w-4 h-4 text-zinc-800" />
                              <span>Chính xác! (+{10 + Math.min(currentStreak * 2, 20)} XP)</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 text-zinc-600" />
                              <span>Chưa chính xác (hoặc đã xem đáp án)</span>
                            </>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mb-0.5">
                          Từ vựng & Cách đọc chuẩn:
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-zinc-800 tracking-wide select-all">
                          {currentItem.vocab} 【 {currentItem.reading} 】
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes & Characteristics */}
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
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 sm:p-3.5">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                          Đặc điểm trọng tâm (Ghi chú):
                        </span>
                        <p className="text-zinc-800 font-medium leading-relaxed">
                          {currentItem.notes || "Không có ghi chú thêm."}
                        </p>
                      </div>

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

                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setJumpInput(String(currentIndex + 1));
                      setIsJumpModalOpen(true);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-800 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md transition"
                  >
                    Nhảy đến câu #...
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-medium text-zinc-700 hover:text-zinc-800 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 transition min-h-[40px]"
                  >
                    <span>Từ sau</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: GAME GHÉP THẺ TỐC ĐỘ (SPEED MATCH GAME)           */}
        {/* ======================================================== */}
        {tab === "match" && (
          <div className="flex flex-col gap-4">
            {/* Game Header Bar */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-zinc-700" />
                  <h2 className="text-base font-bold text-zinc-800">
                    Trò chơi Ghép Thẻ Thần Tốc
                  </h2>
                </div>
                <p className="text-xs text-zinc-500">
                  Chạm vào cặp Từ vựng và Cách đọc tương ứng nhanh nhất có thể!
                </p>
              </div>

              {/* Match Game Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mode toggle: Ghép cách đọc VS Ý nghĩa */}
                <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
                  <button
                    onClick={() => {
                      setMatchModeType("reading");
                      soundFX.playClick();
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                      matchModeType === "reading"
                        ? "bg-white text-zinc-800 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    Cách đọc
                  </button>
                  <button
                    onClick={() => {
                      setMatchModeType("meaning");
                      soundFX.playClick();
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                      matchModeType === "meaning"
                        ? "bg-white text-zinc-800 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    Ý nghĩa
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Timer */}
                  <div className="flex items-center gap-1 font-mono font-bold text-sm bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200">
                    <Timer className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{matchTimer.toFixed(1)}s</span>
                  </div>

                  <button
                    onClick={startNewMatchGame}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 text-white text-xs font-medium rounded-lg transition shadow-sm"
                  >
                    Ván mới
                  </button>
                </div>
              </div>
            </div>

            {/* Match Game Board Grid */}
            {!isMatchFinished ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3.5">
                {matchCards.map((card) => {
                  const isSelected = selectedCards.some((c) => c.id === card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      disabled={card.matched}
                      className={`min-h-[60px] sm:min-h-[90px] p-2 sm:p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                        card.matched
                          ? "bg-zinc-50 border-zinc-200/50 opacity-20 pointer-events-none scale-90"
                          : isSelected
                          ? "bg-zinc-800 text-white border-zinc-800 shadow-md scale-102"
                          : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 shadow-sm"
                      }`}
                    >
                      <span
                        className={`font-bold select-none leading-tight break-words max-w-full ${
                          card.type === "word"
                            ? "text-xs sm:text-xl font-bold"
                            : "text-[11px] sm:text-base font-medium"
                        }`}
                      >
                        {card.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Match Victory Screen */
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-10 text-center shadow-sm max-w-md mx-auto w-full my-4 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-zinc-100 text-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Trophy className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-1">
                  Hoàn Thành Xuất Sắc!
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Bạn đã ghép chính xác tất cả các cặp từ vựng.
                </p>

                <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-5">
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase block mb-0.5">
                      Thời gian ván này
                    </span>
                    <span className="text-2xl font-mono font-bold text-zinc-800">
                      {matchTimer.toFixed(1)}s
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase block mb-0.5">
                      Kỷ lục nhanh nhất
                    </span>
                    <span className="text-2xl font-mono font-bold text-zinc-700">
                      {matchBestTime !== null ? `${matchBestTime.toFixed(1)}s` : "--"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startNewMatchGame}
                  className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 text-white font-medium text-sm rounded-xl transition shadow-sm"
                >
                  Chơi ván tiếp theo →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: GAME ĐUA TỐC ĐỘ 60S (SPEED RUN TIME ATTACK)        */}
        {/* ======================================================== */}
        {tab === "speed" && (
          <div className="flex flex-col gap-4">
            {/* Speed Run Header */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <h2 className="text-base font-bold text-zinc-800">
                    Đua Tốc Độ 60 Giây
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Chọn nhanh cách đọc đúng trước khi đồng hồ điểm 0!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Countdown Timer */}
                <div
                  className={`flex items-center gap-1 font-mono font-bold text-base px-3 py-1.5 rounded-lg border ${
                    speedTimeLeft <= 10
                      ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                      : "bg-zinc-100 text-zinc-800 border-zinc-200"
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span>{speedTimeLeft}s</span>
                </div>

                {/* Score */}
                <div className="font-mono font-bold text-base bg-zinc-800 text-white px-3 py-1.5 rounded-lg">
                  {speedScore} pts
                </div>
              </div>
            </div>

            {/* Speed Run Active Playing Arena */}
            {isSpeedRunning && speedCurrentWord && !isSpeedFinished ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-10 shadow-sm flex flex-col items-center text-center">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Chọn cách đọc đúng của từ:
                </span>
                <div className="text-3xl sm:text-6xl font-bold tracking-tight text-zinc-800 my-2 sm:my-4 select-all break-words">
                  {speedCurrentWord.vocab}
                </div>

                {/* 4 Choices Grid (2x2 for mobile thumb ergonomics) */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-md mt-2 sm:mt-4">
                  {speedOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSpeedAnswer(opt)}
                      className="py-3 sm:py-3.5 px-2 sm:px-4 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-200 hover:border-zinc-400 rounded-xl text-sm sm:text-base font-semibold text-zinc-800 transition shadow-sm active:scale-98 min-h-[44px]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Instant Feedback indicator */}
                {speedFeedback && (
                  <div className="mt-4 text-xs font-bold animate-in fade-in">
                    {speedFeedback === "correct" ? (
                      <span className="text-zinc-800">✓ Đúng! +10 điểm (+1s)</span>
                    ) : (
                      <span className="text-zinc-500">✗ Sai rồi!</span>
                    )}
                  </div>
                )}
              </div>
            ) : isSpeedFinished ? (
              /* Speed Game Over Screen */
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-10 text-center shadow-sm max-w-md mx-auto w-full my-4 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-zinc-100 text-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Trophy className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-1">
                  Hết Giờ!
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Bạn đã hoàn thành thử thách phản xạ 60 giây.
                </p>

                <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-5">
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase block mb-0.5">
                      Điểm số đạt được
                    </span>
                    <span className="text-3xl font-mono font-bold text-zinc-800">
                      {speedScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase block mb-0.5">
                      Kỷ lục cao nhất
                    </span>
                    <span className="text-3xl font-mono font-bold text-zinc-700">
                      {speedHighScore}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startSpeedRun}
                  className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 text-white font-medium text-sm rounded-xl transition shadow-sm"
                >
                  Chơi lại ván mới →
                </button>
              </div>
            ) : (
              /* Start Speed Run Lobby */
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm max-w-md mx-auto w-full my-4">
                <div className="w-16 h-16 bg-zinc-100 text-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-2">
                  Sẵn Sàng Thử Thách 60s?
                </h3>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                  Đua với thời gian để trả lời nhiều từ vựng N2 nhất có thể. Mỗi câu đúng cộng 10 điểm và thưởng thêm 1 giây!
                </p>
                <button
                  onClick={startSpeedRun}
                  className="w-full py-3.5 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 text-white font-bold text-sm rounded-xl transition shadow-sm"
                >
                  Bắt Đầu Đua Ngay!
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: TABLE & CARD LIST VIEW (TRA CỨU & GHI CHÚ)         */}
        {/* ======================================================== */}
        {tab === "list" && (
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
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <button
                  onClick={() => setTableExpanded(!tableExpanded)}
                  title={
                    tableExpanded
                      ? "Thu gọn kích thước vừa phải"
                      : "Mở rộng bảng toàn màn hình"
                  }
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

            {/* Mobile View: Cards */}
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

            {/* Desktop View: Full Table */}
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
                        <td className="p-3.5 text-center text-zinc-400 font-mono">
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
                            className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-700 hover:text-white text-zinc-700 text-[11px] rounded border border-zinc-200 transition"
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

      {/* JUMP TO QUESTION MODAL */}
      {isJumpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-zinc-300 rounded-2xl p-5 sm:p-6 max-w-xs w-full shadow-xl">
            <h3 className="text-sm font-bold text-zinc-800 mb-1">
              Nhảy đến câu số...
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Nhập số câu từ 1 đến {filteredList.length}:
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJumpToQuestion(Number(jumpInput));
              }}
            >
              <input
                type="number"
                min={1}
                max={filteredList.length}
                value={jumpInput}
                autoFocus
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={`1 - ${filteredList.length}`}
                className="w-full text-center text-xl font-bold py-2.5 px-3 border border-zinc-300 rounded-lg outline-none focus:border-zinc-700 mb-3"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsJumpModalOpen(false)}
                  className="flex-1 py-2 text-xs text-zinc-600 hover:bg-zinc-100 border border-zinc-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-zinc-700 hover:bg-zinc-800 rounded-lg shadow-sm"
                >
                  Đi đến câu này
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-3 sm:py-4 mt-6 text-center text-[11px] sm:text-xs text-zinc-400 px-4">
        <div className="max-w-md mx-auto flex items-center justify-center gap-1.5 text-zinc-500 mb-1">
          <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
          <span>Học trên điện thoại (cùng Wi-Fi):</span>
          <span className="font-mono font-medium text-zinc-800 select-all">
            http://192.168.1.233:3000
          </span>
        </div>
        <p>Bộ từ vựng ôn tập JLPT N2 • Gamification & 2 Minigame hấp dẫn</p>
      </footer>
    </div>
  );
}
