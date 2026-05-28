import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  Award,
  CheckCircle,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  Info,
  Settings,
  HelpCircle,
  Trophy,
  Home,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Compass,
  Check,
  Clock,
  AlertTriangle,
  Play,
  Heart,
  Smartphone,
  Sparkles
} from "lucide-react";

import { Level, PlayerProfile, GameSettings, UserLevelProgress, Achievement } from "./types";
import { levels } from "./data/levels";
import { SceneRenderer } from "./components/SceneRenderer";
import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE
} from "./data/gameStateDefaults";
import {
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
  playHintSound,
  playLevelCompletionSound,
  getSoundEnabled,
  setSoundEnabled
} from "./utils/sound";
import { formatTime, calculateStars, calculateScore } from "./utils/gameMath";

export default function App() {
  // Profiles and Settings states
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Active Screen tracking
  const [activeScreen, setActiveScreen] = useState<"menu" | "level" | "achievements" | "help">("menu");

  // Game/Level dynamic state
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isLevelActive, setIsLevelActive] = useState(false);
  const [wrongClicksCount, setWrongClicksCount] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  
  // Combos & Multipliers
  const [comboCount, setComboCount] = useState(1);
  const [comboTimeout, setComboTimeout] = useState<NodeJS.Timeout | null>(null);

  // FX & Visual Clicks
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [activeHintId, setActiveHintId] = useState<string | null>(null);
  const [floaters, setFloaters] = useState<{ id: string; text: string; x: number; y: number }[]>([]);

  // Modals inside Screens
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Star review of current victory modal
  const [wonStars, setWonStars] = useState(0);

  // Keep levels lists and counts updated safely
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Local Storage Load
  useEffect(() => {
    // Sync sound settings
    const cachedSettings = localStorage.getItem("spot_diff_settings");
    if (cachedSettings) {
      try {
        const parsed = JSON.parse(cachedSettings) as GameSettings;
        setSettings(parsed);
        setSoundEnabled(parsed.soundEnabled);
      } catch (e) {
        console.error("Failed to load settings cached", e);
      }
    } else {
      setSoundEnabled(DEFAULT_SETTINGS.soundEnabled);
    }

    const cachedProfile = localStorage.getItem("spot_diff_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile) as PlayerProfile;
        // Merge achievements with default to handle schema changes gracefully
        const mergedAchievements = DEFAULT_ACHIEVEMENTS.map((defAch) => {
          const matched = parsed.achievements?.find((a) => a.id === defAch.id);
          return matched ? { ...defAch, unlocked: matched.unlocked, progress: matched.progress } : defAch;
        });

        setProfile({
          ...parsed,
          achievements: mergedAchievements,
        });
      } catch (e) {
        console.error("Failed to load profile cached", e);
      }
    }
  }, []);

  // 2. Local Storage Auto Save Trigger
  const saveGameState = (prof: PlayerProfile, sett: GameSettings) => {
    localStorage.setItem("spot_diff_profile", JSON.stringify(prof));
    localStorage.setItem("spot_diff_settings", JSON.stringify(sett));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 3. Audio & Click sound wrapper with global state aware
  const clickSFX = () => {
    if (settings.soundEnabled) {
      playClickSound();
    }
  };

  // 4. Timer effect
  useEffect(() => {
    if (isLevelActive && activeLevel && !showWinModal) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLevelActive, activeLevel, showWinModal]);

  // 5. Check if Achievement Unlocks
  const checkAchievements = (updatedProfile: PlayerProfile) => {
    let changed = false;
    const list = [...updatedProfile.achievements];

    // Check Speed Runner: Complete in under 45 seconds
    const completedList = Object.values(updatedProfile.levelsProgress) as UserLevelProgress[];
    
    // Scout Level: any level completed
    const hasCompletedAny = completedList.some(p => p.completed);
    const scout = list.find(a => a.id === "scout_level");
    if (scout && !scout.unlocked && hasCompletedAny) {
      scout.unlocked = true;
      scout.progress = 1;
      changed = true;
      triggerToast(settings.language === "ru" ? "🔓 Достижение: Начало пути!" : "🔓 Achievement: Beginner Detective!");
    }

    // World Master: all 5 completed
    const completedCount = completedList.filter(p => p.completed).length;
    const worldMaster = list.find(a => a.id === "all_worlds");
    if (worldMaster && worldMaster.progress !== completedCount) {
      worldMaster.progress = completedCount;
      if (completedCount >= 5 && !worldMaster.unlocked) {
        worldMaster.unlocked = true;
        triggerToast(settings.language === "ru" ? "🏆 Достижение: Покоритель Миров!" : "🏆 Achievement: World Master!");
      }
      changed = true;
    }

    return { updatedList: list, changed };
  };

  // 6. Handle Clicks on Left/Right viewport coordinates (0 to 100%)
  const handleSpotClick = (clickX: number, clickY: number) => {
    if (!activeLevel || showWinModal) return;

    // Search if clicked spot coordinates fall inside any unfound Difference tolerance circle radius
    const targetDiff = activeLevel.differences.find((diff) => {
      // Check if already found
      if (foundIds.includes(diff.id)) return false;

      // Distance calculation
      const dx = clickX - diff.x;
      const dy = clickY - diff.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= diff.radius;
    });

    if (targetDiff) {
      // SUCCESS: Spot found!
      if (settings.soundEnabled) playCorrectSound();

      // Clear any pending active hint
      if (activeHintId === targetDiff.id) {
        setActiveHintId(null);
      }

      const scoreEarned = calculateScore(comboCount);

      // Add points floater FX
      const newFloater = {
        id: Math.random().toString(),
        text: `+${scoreEarned} PTS ${comboCount > 1 ? `(x${comboCount} Combo!)` : ""}`,
        x: clickX,
        y: clickY,
      };
      setFloaters((prev) => [...prev, newFloater]);

      // Remove floater after animation turns
      setTimeout(() => {
        setFloaters((prev) => prev.filter((f) => f.id !== newFloater.id));
      }, 1500);

      const nextFoundIds = [...foundIds, targetDiff.id];
      setFoundIds(nextFoundIds);

      // Increment Combo Streak
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);

      // Update Profile Achievements logic immediately
      let updatedProfile = { ...profile };
      
      // Update max combos
      if (nextCombo > updatedProfile.maxCombo) {
        updatedProfile.maxCombo = nextCombo;
      }

      // First spot achievement check
      const firstSpotAch = updatedProfile.achievements.find(a => a.id === "first_spot");
      if (firstSpotAch && !firstSpotAch.unlocked) {
        firstSpotAch.unlocked = true;
        firstSpotAch.progress = 1;
        triggerToast(settings.language === "ru" ? "🔓 Достижение: Первая находка!" : "🔓 Achievement: First Discovery!");
      }

      // Combo King Achievement check (Streak x5)
      const comboAch = updatedProfile.achievements.find(a => a.id === "combo_king");
      if (comboAch && !comboAch.unlocked) {
        if (nextCombo >= 5) {
          comboAch.unlocked = true;
          comboAch.progress = 5;
          triggerToast(settings.language === "ru" ? "⚡ Достижение: Комбо Король!" : "⚡ Achievement: Combo King!");
        } else if (nextCombo > comboAch.progress) {
          comboAch.progress = nextCombo;
        }
      }

      updatedProfile.totalScore += scoreEarned;
      setProfile(updatedProfile);
      saveGameState(updatedProfile, settings);

      // Check if LEVEL CLEARED
      if (nextFoundIds.length === activeLevel.totalDifferences) {
        handleLevelVictory(nextFoundIds);
      }
    } else {
      // INCORRECT TAP:
      if (settings.soundEnabled) playIncorrectSound();

      setWrongClicksCount((prev) => prev + 1);
      setComboCount(1); // Reset Combo streak instantly
      
      // Physical effects
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 300);

      // Android Webview Vibration
      if (settings.vibrationEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
  };

  // 7. Handle Level Victory
  const handleLevelVictory = (finalFoundIds: string[]) => {
    setIsLevelActive(false);
    if (settings.soundEnabled) playLevelCompletionSound();

    // Compute star count
    const levelStars = calculateStars(timerSeconds, wrongClicksCount, hintsUsedCount);
    setWonStars(levelStars);

    // Save level statistics progress
    const prevBest = profile.levelsProgress[activeLevel!.id];
    const isFaster = prevBest ? timerSeconds < prevBest.bestTime : true;

    const levelStats: UserLevelProgress = {
      levelId: activeLevel!.id,
      completed: true,
      stars: Math.max(prevBest?.stars || 0, levelStars),
      bestTime: prevBest ? Math.min(prevBest.bestTime, timerSeconds) : timerSeconds,
      foundDifferenceIds: finalFoundIds,
    };

    let updatedProfile = {
      ...profile,
      levelsProgress: {
        ...profile.levelsProgress,
        [activeLevel!.id]: levelStats,
      },
    };

    // Free hint as reward!
    updatedProfile.hintsCount += 1;

    // Check achievement: Fast solver under 45s
    if (timerSeconds < 45) {
      const speedAch = updatedProfile.achievements.find(a => a.id === "speed_runner");
      if (speedAch && !speedAch.unlocked) {
        speedAch.unlocked = true;
        speedAch.progress = 1;
        triggerToast(settings.language === "ru" ? "⚡ Достижение: Быстрее ветра!" : "⚡ Achievement: Lightning Eye!");
      }
    }

    // Check achievement: Perfect Score (0 mistakes, 0 hints)
    if (wrongClicksCount === 0 && hintsUsedCount === 0) {
      const perfectAch = updatedProfile.achievements.find(a => a.id === "perfect_score");
      if (perfectAch && !perfectAch.unlocked) {
        perfectAch.unlocked = true;
        perfectAch.progress = 1;
        triggerToast(settings.language === "ru" ? "🌟 Достижение: Безупречный сыщик!" : "🌟 Achievement: Flawless Mind!");
      }
    }

    // General master audit
    const checkRes = checkAchievements(updatedProfile);
    if (checkRes.changed) {
      updatedProfile.achievements = checkRes.updatedList;
    }

    setProfile(updatedProfile);
    saveGameState(updatedProfile, settings);
    setShowWinModal(true);
  };

  // 8. Trigger Hint Utility
  const useHint = () => {
    if (showWinModal || !activeLevel) return;

    if (profile.hintsCount <= 0) {
      triggerToast(settings.language === "ru" ? "⚠️ Нет доступных подсказок! Пройдите уровень для получения." : "⚠️ Out of hints! Pass level to reward.");
      return;
    }

    // Search for a difference that has not been found yet
    const unfoundDiff = activeLevel.differences.find((d) => !foundIds.includes(d.id));
    if (unfoundDiff) {
      if (settings.soundEnabled) playHintSound();

      setActiveHintId(unfoundDiff.id);
      setHintsUsedCount((prev) => prev + 1);

      // Consume one hint
      const nextProfile = {
        ...profile,
        hintsCount: Math.max(0, profile.hintsCount - 1),
      };
      setProfile(nextProfile);
      saveGameState(nextProfile, settings);

      triggerToast(settings.language === "ru" ? "✨ Подсказка активирована! Посмотрите на мигающий круг." : "✨ Hint activated! Look for the blinking light.");

      // Turn off hint pulse after 5 seconds
      setTimeout(() => {
        setActiveHintId(null);
      }, 5000);
    }
  };

  // Start Level
  const startLevel = (lvl: Level) => {
    clickSFX();
    setActiveLevel(lvl);
    setFoundIds([]);
    setTimerSeconds(0);
    setWrongClicksCount(0);
    setHintsUsedCount(0);
    setComboCount(1);
    setActiveHintId(null);
    setShowWinModal(false);
    setIsLevelActive(true);
    setActiveScreen("level");
  };

  // Reset current active level
  const restartLevel = () => {
    if (!activeLevel) return;
    clickSFX();
    startLevel(activeLevel);
  };

  const quitToMenu = () => {
    clickSFX();
    setIsLevelActive(false);
    setActiveLevel(null);
    setShowWinModal(false);
    setActiveScreen("menu");
  };

  // Adjust config settings changes
  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    const nextSet = { ...settings, soundEnabled: nextVal };
    setSettings(nextSet);
    setSoundEnabled(nextVal);
    saveGameState(profile, nextSet);
    if (nextVal) playClickSound();
  };

  const toggleVibration = () => {
    const nextVal = !settings.vibrationEnabled;
    const nextSet = { ...settings, vibrationEnabled: nextVal };
    setSettings(nextSet);
    saveGameState(profile, nextSet);
    clickSFX();
  };

  const toggleLanguage = () => {
    const nextLang = settings.language === "ru" ? "en" : "ru";
    const nextSet = { ...settings, language: nextLang };
    setSettings(nextSet);
    saveGameState(profile, nextSet);
    clickSFX();
  };

  const clearProgress = () => {
    if (confirm(settings.language === "ru" ? "Вы уверены, что хотите сбросить весь прогресс?" : "Are you sure you want to completely wipe all progress?")) {
      setProfile(DEFAULT_PROFILE);
      saveGameState(DEFAULT_PROFILE, settings);
      triggerToast(settings.language === "ru" ? "🔥 Прогресс полностью сброшен!" : "🔥 Play stats wiped!");
      setIsSettingsOpen(false);
      quitToMenu();
    }
  };

  // Layout helper: Count total stars obtained
  const getTotalStarsCollected = () => {
    return (Object.values(profile.levelsProgress) as UserLevelProgress[]).reduce((acc, curr) => acc + curr.stars, 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-slate-900 transition-colors duration-300">
      
      {/* 1. Global Navigation Bar Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Title */}
          <button onClick={quitToMenu} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all group-hover:scale-105">
              <Eye className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-300 bg-clip-text text-transparent">
                {settings.language === "ru" ? "Найди Отличия" : "Spot Differences"}
              </h1>
              <span className="text-xs text-slate-400 block font-mono -mt-1 font-semibold tracking-widest uppercase">
                {settings.language === "ru" ? "МИРЫ ВЕКТОРОВ" : "VECTOR WORLDS"}
              </span>
            </div>
          </button>

          {/* Player stats widget */}
          <div className="flex items-center gap-3">
            {/* Total Balance / Coins */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/60 rounded-full py-1 px-3 border border-slate-700 font-mono text-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-350">{settings.language === "ru" ? "Очки" : "Score"}:</span>
              <span className="text-amber-400 font-bold">{profile.totalScore}</span>
            </div>

            {/* Total Stars tally */}
            <div className="flex items-center gap-1 bg-amber-500/10 rounded-full py-1 px-2.5 border border-amber-500/30 text-amber-400 font-bold text-xs">
              <span className="text-yellow-400 font-mono">★</span>
              <span>{getTotalStarsCollected()}</span>
            </div>

            {/* Toggles and Quick buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 transition"
                title="Звук"
              >
                {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              </button>

              <button
                onClick={() => { clickSFX(); setIsSettingsOpen(true); }}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 transition"
                title="Настройки"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Main Container Shell */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Shaking Container for mistakes */}
        <div className={`transition-transform duration-100 ${shakeScreen ? "animate-bounce border-2 border-red-500/80 rounded-2xl p-1" : ""}`}>
          
          <AnimatePresence mode="wait">
            
            {/* SCREEN A: Main Menu/Levels Lists */}
            {activeScreen === "menu" && (
              <motion.div
                key="menu-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                
                {/* Hero Banner Grid Card */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                  {/* Glowing background decor */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-[80px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full filter blur-[80px] pointer-events-none" />

                  <div className="space-y-3 max-w-xl text-center md:text-left z-10">
                    <span className="inline-flex items-center gap-1 bg-cyan-400/15 text-cyan-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-cyan-400/20 uppercase tracking-widest font-mono">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" strokeWidth={3} />
                      {settings.language === "ru" ? "ПАЗЛ КЛИКЕР НА ТЕЛЕФОН" : "PORTABLE VECTOR ARCADE"}
                    </span>
                    <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-slate-300 bg-clip-text text-transparent">
                      {settings.language === "ru" ? "Найди все скрытые аномалии!" : "Spot all hidden anomalies!"}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                      {settings.language === "ru" 
                        ? "Рассматривайте оригинальное и искажённое изображения, тапайте по отличиям и собирайте драгоценные звёзды. Разблокируйте все удивительные живые миры!" 
                        : "Compare the original and modified world versions side-by-side to spot tiny structural offsets. Maximize precision to secure high score combos!"}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                      <button
                        onClick={() => { clickSFX(); setActiveScreen("help"); }}
                        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl text-sm transition"
                      >
                        <HelpCircle className="w-4 h-4" />
                        {settings.language === "ru" ? "Как играть?" : "How to play?"}
                      </button>

                      <button
                        onClick={() => { clickSFX(); setActiveScreen("achievements"); }}
                        className="inline-flex items-center gap-2 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 border border-purple-550/30 font-semibold py-2 px-4 rounded-xl text-sm transition"
                      >
                        <Trophy className="w-4 h-4 text-purple-400" />
                        {settings.language === "ru" ? "Достижения" : "Achievements"}
                      </button>
                    </div>
                  </div>

                  {/* Right Art Asset/Showcase */}
                  <div className="relative w-full max-w-[240px] aspect-square rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 shadow-inner">
                    <div className="absolute top-2 right-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
                      ONLINE
                    </div>
                    {/* Minimal decorative circular radar lines */}
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-cyan-500/20 animate-spin flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-cyan-400 rotate-12 transition-transform" />
                      </div>
                    </div>
                    <span className="text-xs font-mono mt-4 text-slate-400 text-center uppercase tracking-wider">
                      {settings.language === "ru" ? "5 Уровней Готовы" : "5 Levels Ready"}
                    </span>
                  </div>
                </div>

                {/* Level Grid Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-cyan-400" />
                      {settings.language === "ru" ? "Выберите локацию" : "Select Location"}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-800 py-1 px-3 rounded-full">
                      {settings.language === "ru" ? `Пройдено: ${(Object.values(profile.levelsProgress) as UserLevelProgress[]).filter((l) => l.completed).length}/5` : `Cleared: ${(Object.values(profile.levelsProgress) as UserLevelProgress[]).filter((l) => l.completed).length}/5`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levels.map((level, idx) => {
                      const progress = profile.levelsProgress[level.id];
                      const isPreviouslyCompleted = !!progress?.completed;
                      const userStars = progress?.stars || 0;
                      const bestTime = progress?.bestTime;

                      // Level unlocked checking (first level or previous completed)
                      const isUnlocked = level.id === 1 || !!profile.levelsProgress[level.id - 1]?.completed;

                      return (
                        <div
                          key={`lvl-card-${level.id}`}
                          className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-slate-900 shadow-xl ${
                            isUnlocked
                              ? "border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                              : "border-slate-950 opacity-60 pointer-events-none"
                          }`}
                        >
                          {/* Top Visual category cover */}
                          <div className="h-28 relative flex items-end p-4 bg-slate-950">
                            {/* Decorative grid pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:16px_16px] opacity-10" />

                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              {/* Level difficulty tag */}
                              <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                                level.difficulty === "Легко" 
                                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" 
                                  : level.difficulty === "Средне"
                                    ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                                    : "bg-rose-950/80 text-rose-400 border border-rose-800"
                              }`}>
                                {settings.language === "ru" ? level.difficulty : level.difficultyEn}
                              </span>
                            </div>

                            {/* Completed stamp banner */}
                            {isPreviouslyCompleted && (
                              <div className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 py-0.5 px-2 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                DONE
                              </div>
                            )}

                            {/* Theme name title inside view */}
                            <div className="z-10">
                              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold block mb-0.5">{level.category}</span>
                              <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                                #{level.id} {settings.language === "ru" ? level.title : level.titleEn}
                              </h4>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8">
                              {settings.language === "ru" ? level.description : level.descriptionEn}
                            </p>

                            {/* Stars indicator and stats */}
                            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                              
                              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>{settings.language === "ru" ? "Рекорд" : "Best"}:</span>
                                <span className="font-bold text-slate-200">
                                  {bestTime ? formatTime(bestTime) : "--:--"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map((starIdx) => (
                                  <span
                                    key={`card-star-${idx}-${starIdx}`}
                                    className={`text-sm ${
                                      userStars >= starIdx ? "text-yellow-400 animate-pulse" : "text-slate-700"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>

                            </div>

                            {/* Playing trigger button */}
                            <button
                              onClick={() => startLevel(level)}
                              className={`w-full font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                                isUnlocked
                                  ? "bg-slate-800 hover:bg-cyan-500 hover:text-slate-900 text-slate-200 shadow-md"
                                  : "bg-slate-950 text-slate-700 select-none"
                              }`}
                            >
                              {isUnlocked ? (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  {settings.language === "ru" ? "ИГРАТЬ" : "PLAY LEVEL"}
                                </>
                              ) : (
                                <>
                                  <span>🔒 {settings.language === "ru" ? "Заблокировано" : "Locked"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* SCREEN B: Active Play Field */}
            {activeScreen === "level" && activeLevel && (
              <motion.div
                key="play-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                
                {/* Active Info Header */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  
                  {/* Exit & Location text */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={quitToMenu}
                      className="p-2 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition"
                      title="Выход в меню"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                        <span className="text-cyan-400 font-mono">#{activeLevel.id}</span>
                        {settings.language === "ru" ? activeLevel.title : activeLevel.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                        {settings.language === "ru" ? "Найдите 6 отличий" : "Find 6 differences"}
                      </p>
                    </div>
                  </div>

                  {/* Combo Streak & Found progress widgets */}
                  <div className="flex flex-wrap items-center gap-4 justify-center">
                    
                    {/* Live Digital Timer */}
                    {settings.showTimer && (
                      <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
                        <span className="text-slate-400">TIME:</span>
                        <span className="text-cyan-300 font-bold">{formatTime(timerSeconds)}</span>
                      </div>
                    )}

                    {/* Mistakes tally */}
                    <div className="flex items-center gap-1 bg-rose-500/10 text-rose-450 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold">
                      <span>{settings.language === "ru" ? "Ошибки:" : "Mistakes:"}</span>
                      <span className="text-rose-400">{wrongClicksCount}</span>
                    </div>

                    {/* Progress Found Counter */}
                    <div className="flex items-center gap-2 bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                          <div
                            key={`dot-progress-${idx}`}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                              foundIds.length >= idx
                                ? "bg-emerald-400 shadow-[0_0_8px_#34d399] scale-110"
                                : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 ml-1.5">
                        {foundIds.length}/6
                      </span>
                    </div>

                    {/* Combo Multiplier Floater and Tracker */}
                    <div className="relative flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 py-1.5 px-3 rounded-lg text-xs font-mono font-bold text-purple-300 animate-pulse">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>MUT: x{comboCount}</span>
                    </div>

                  </div>
                </div>

                {/* Grid Container for SVGs Side-by-Side (Desktop) or stacked Vertically (Mobile) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Panel Left/Top: ORIGINAL */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                        🔍 {settings.language === "ru" ? "Оригинал" : "Original"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">VIEWPORT A</span>
                    </div>
                    
                    <SceneRenderer
                      levelId={activeLevel.id}
                      isModified={false}
                      foundIds={foundIds}
                      onViewClick={handleSpotClick}
                      showHintId={activeHintId}
                    />
                  </div>

                  {/* Panel Right/Bottom: MODIFIED */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
                        👾 {settings.language === "ru" ? "Найди отличия тут!" : "Spot adjustments here!"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">VIEWPORT B</span>
                    </div>

                    <SceneRenderer
                      levelId={activeLevel.id}
                      isModified={true}
                      foundIds={foundIds}
                      onViewClick={handleSpotClick}
                      showHintId={activeHintId}
                    />

                    {/* Floating score floaters animation on Modified image */}
                    {floaters.map((f) => (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 1, y: f.y - 10, scale: 0.8 }}
                        animate={{ opacity: 0, y: f.y - 50, scale: 1.2 }}
                        className="absolute text-cyan-400 font-extrabold font-mono text-sm sm:text-md pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-30"
                        style={{ left: `${f.x}%`, top: `${f.y}%` }}
                      >
                        {f.text}
                      </motion.div>
                    ))}
                  </div>

                </div>

                {/* Level Action controls bottom deck */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={quitToMenu}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 px-5 rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <Home className="w-4 h-4" />
                      {settings.language === "ru" ? "Все уровни" : "All levels"}
                    </button>

                    <button
                      onClick={restartLevel}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 px-5 rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {settings.language === "ru" ? "Начать заново" : "Restart level"}
                    </button>
                  </div>

                  {/* Hints container triggers and totals */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">AVAILABLE HINTS</span>
                      <span className="text-slate-300 font-bold text-sm">
                        {profile.hintsCount} {settings.language === "ru" ? "подсказок" : "hints left"}
                      </span>
                    </div>

                    <button
                      onClick={useHint}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3 px-6 rounded-xl text-xs shadow-md transition flex items-center gap-2 self-stretch"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950 opacity-90 animate-spin" style={{ animationDuration: "12s" }} />
                      {settings.language === "ru" ? "ИСПОЛЬЗОВАТЬ ПОДСКАЗКУ" : "GET HINT DISCLOSURE"}
                    </button>
                  </div>

                </div>

              </motion.div>
            )}

            {/* SCREEN C: Achievements Tab List */}
            {activeScreen === "achievements" && (
              <motion.div
                key="achievements-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Board info */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      {settings.language === "ru" ? "Достижения Сыщика" : "Detective Trophies"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {settings.language === "ru" ? "Выполняйте условия и зарабатывайте уникальные медали." : "Perform custom level objectives to unlock medal accolades."}
                    </p>
                  </div>

                  <button
                    onClick={quitToMenu}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold py-2 px-4 rounded-xl text-xs transition"
                  >
                    {settings.language === "ru" ? "В меню" : "Back Menu"}
                  </button>
                </div>

                {/* Achievements List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((item) => {
                    return (
                      <div
                        key={`ach-${item.id}`}
                        className={`p-5 rounded-2xl border flex items-start gap-4 transition duration-300 bg-slate-900 ${
                          item.unlocked
                            ? "border-amber-500/30 shadow-[0_4px_15px_rgba(245,158,11,0.05)] bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20"
                            : "border-slate-800 opacity-60"
                        }`}
                      >
                        {/* Graphic Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.unlocked
                            ? "bg-amber-500/20 text-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            : "bg-slate-800 text-slate-500"
                        }`}>
                          {item.id === "first_spot" ? <Eye className="w-6 h-6" /> : null}
                          {item.id === "scout_level" ? <Award className="w-6 h-6" /> : null}
                          {item.id === "perfect_score" ? <CheckCircle className="w-6 h-6" /> : null}
                          {item.id === "all_worlds" ? <Globe className="w-6 h-6" /> : null}
                          {item.id === "combo_king" ? <Zap className="w-6 h-6" /> : null}
                          {item.id === "speed_runner" ? <Clock className="w-6 h-6" /> : null}
                        </div>

                        {/* Title details */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-bold ${item.unlocked ? "text-amber-400" : "text-slate-200"}`}>
                              {settings.language === "ru" ? item.title : item.titleEn}
                            </h4>
                            {item.unlocked && (
                              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 border border-emerald-900 rounded px-2">
                                UNLOCKED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {settings.language === "ru" ? item.description : item.descriptionEn}
                          </p>
                          
                          {/* Progress meter */}
                          <div className="pt-2">
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${item.unlocked ? "bg-amber-400" : "bg-slate-700"}`}
                                style={{ width: `${(item.progress / item.maxProgress) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-550 pt-1">
                              <span>PROGRESS</span>
                              <span>{item.progress} / {item.maxProgress}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </motion.div>
            )}

            {/* SCREEN D: Help & Instructions Screen */}
            {activeScreen === "help" && (
              <motion.div
                key="help-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <HelpCircle className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {settings.language === "ru" ? "Правила игры в поиск отличий" : "How to Spot Differences"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {settings.language === "ru" ? "Инструкция для начинающих сыщиков" : "Essential manual guidelines for detectives"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <p>
                    {settings.language === "ru"
                      ? "Добро пожаловать в красивейший визуальный симулятор детектива! Ваша задача — обнаружить 6 отличий между двумя изображениями:"
                      : "Welcome to our procedural vector visual training space. Your task is to accurately locate 6 discrete adjustments made to the bottom/right image compared to the master original plate:"}
                  </p>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-805/80 font-mono text-xs text-slate-400">
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold">1.</span>
                      <span>{settings.language === "ru" ? "Сравнивайте картинки на экранах. Нажмите по отличию на любом из экранов." : "Compare both screens. Tap of click on the discrepancy inside either view."}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold">2.</span>
                      <span>{settings.language === "ru" ? "Каждый успешный клик даёт очки и увеличивает силу Комбо-кликов (добавочный множитель)." : "Consecutive correct triggers multiply points rewards via a combo rating."}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold">3.</span>
                      <span>{settings.language === "ru" ? "Ошибочные клики сбрасывают текущее Комбо и могут стать причиной вибрации телефона." : "Mistakes and incorrect tap offsets reset the combo tally and shake the frame."}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold">4.</span>
                      <span>{settings.language === "ru" ? "Если вы зашли в тупик, воспользуйтесь бесплатными Подсказками, которые даются за прохождение." : "Stuck? Tap the Hint disclosures button to draw coordinates attention directly."}</span>
                    </div>
                  </div>

                  <p>
                    {settings.language === "ru"
                      ? "Звёзды (от 1 до 3) присуждаются за быстродействие и внимательность: пройдите карту менее чем за 55 секунд и сделайте не более 2 промахов для золотых 3 звезд!"
                      : "Star awards are fully dynamic: secure full completion in less than 55 seconds with fewer than 2 mistakes to bag supreme 3 Golden Stars!"}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={quitToMenu}
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition"
                  >
                    {settings.language === "ru" ? "ПОНЯТНО, ИГРАТЬ!" : "PLAY GAME!"}
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>

      {/* 3. Global Toast Alerts Pop */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-cyan-500 text-cyan-300 font-bold font-mono text-xs tracking-wide py-2.5 px-5 rounded-full shadow-[0_4px_25px_rgba(6,182,212,0.3)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MODAL DRAWER: LEVEL VICTORY SPLASH CARD */}
      <AnimatePresence>
        {showWinModal && activeLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(52,211,153,0.15)] space-y-6 text-center"
            >
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase block">
                  {settings.language === "ru" ? "МИССИЯ ВЫПОЛНЕНА" : "ANOMALY RESOLVED"}
                </span>
                <h2 className="text-2xl sm:text-3.5xl font-extrabold text-white">
                  {settings.language === "ru" ? "Успешная зачистка!" : "World Pure Cleared!"}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {settings.language === "ru" ? `Мир #${activeLevel.id}: ` : `Location #${activeLevel.id}: `}
                  <span className="text-slate-200 font-semibold">{settings.language === "ru" ? activeLevel.title : activeLevel.titleEn}</span>
                </p>
              </div>

              {/* Bouncing Gold Stars visual block */}
              <div className="flex justify-center items-center gap-4 py-3 bg-slate-950/50 rounded-2xl border border-slate-850">
                {[1, 2, 3].map((starIdx) => (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ 
                      scale: wonStars >= starIdx ? [0, 1.4, 1] : 0.8, 
                      rotate: wonStars >= starIdx ? 0 : 0,
                    }}
                    transition={{ delay: 0.15 * starIdx, type: "spring", stiffness: 120 }}
                    key={`win-star-${starIdx}`}
                    className={`text-4.5xl sm:text-5.5xl leading-none filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.2)] ${
                      wonStars >= starIdx ? "text-yellow-400" : "text-slate-800"
                    }`}
                  >
                    ★
                  </motion.span>
                ))}
              </div>

              {/* Statistics details */}
              <div className="grid grid-cols-2 gap-3 pb-2 text-left font-mono text-xs">
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-slate-500 text-[10px] block mb-1">TIME TAKEN</span>
                  <span className="text-cyan-400 font-bold text-lg">{formatTime(timerSeconds)}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-slate-500 text-[10px] block mb-1">MISTAKES</span>
                  <span className="text-rose-450 font-bold text-lg">{wrongClicksCount}</span>
                </div>

              </div>

              {/* Victory rewards feedback */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-xs text-emerald-300">
                🎉 {settings.language === "ru" 
                  ? "Награда: +1 бесплатная подсказка и сохранение рекорда!" 
                  : "Reward: +1 hints credit credited! Record saved."}
              </div>

              {/* Actions navigation */}
              <div className="space-y-2 pt-2">
                
                {/* Check if next level exists */}
                {levels.find((l) => l.id === activeLevel.id + 1) ? (
                  <button
                    onClick={() => {
                      const nextLvlDef = levels.find((l) => l.id === activeLevel.id + 1)!;
                      startLevel(nextLvlDef);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-extrabold py-3 px-6 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>{settings.language === "ru" ? "СЛЕДУЮЩИЙ МИР" : "NEXT SYSTEM LEVEL"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={quitToMenu}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-950 font-extrabold py-3 px-6 rounded-xl text-sm shadow-md transition"
                  >
                    {settings.language === "ru" ? "УСПЕШНО ЗАВЕРШЕНО!" : "ALL MISSIONS SOLVED!"}
                  </button>
                )}

                <button
                  onClick={quitToMenu}
                  className="w-full bg-slate-850 hover:bg-slate-800 text-slate-350 font-semibold py-2.5 px-6 rounded-xl text-xs transition"
                >
                  {settings.language === "ru" ? "В главное меню" : "Back to Dashboard"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL DRAWER: SETTINGS PANEL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2.5xl space-y-5"
            >
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-400" />
                  {settings.language === "ru" ? "Настройки игры" : "System Settings"}
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Toggles list settings */}
              <div className="space-y-4 text-xs sm:text-sm">
                
                {/* Sound toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">{settings.language === "ru" ? "Звуковые эффекты" : "Sound Synthesizer"}</span>
                    <span className="text-slate-450 text-[10px]">{settings.language === "ru" ? "Процедурные щелчки и победы" : "Synth alerts and chords"}</span>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 flex ${
                      settings.soundEnabled ? "bg-cyan-500 justify-end" : "bg-slate-800 justify-start"
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Vibration toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">{settings.language === "ru" ? "Вибрация телефона" : "Haptic Vibration"}</span>
                    <span className="text-slate-450 text-[10px]">{settings.language === "ru" ? "Виброотклик для Android" : "Tactile feel on errors"}</span>
                  </div>
                  <button
                    onClick={toggleVibration}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 flex ${
                      settings.vibrationEnabled ? "bg-cyan-500 justify-end" : "bg-slate-800 justify-start"
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Language translation switch */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">{settings.language === "ru" ? "Язык интерфейса" : "Language Selection"}</span>
                    <span className="text-slate-450 text-[10px]">{settings.language === "ru" ? "Русский / Русский" : "Change game language"}</span>
                  </div>
                  <button
                    onClick={toggleLanguage}
                    className="bg-slate-850 hover:bg-slate-800 py-1.5 px-3 rounded-lg text-xs font-bold font-mono text-cyan-400 border border-slate-750"
                  >
                    {settings.language === "ru" ? "РУССКИЙ" : "ENGLISH"}
                  </button>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <button
                  onClick={clearProgress}
                  className="w-full bg-rose-950/40 hover:bg-rose-900/50 text-rose-450 hover:text-rose-400 border border-rose-900/40 font-semibold py-2 px-4 rounded-xl text-xs transition"
                >
                  ⚠️ {settings.language === "ru" ? "СБРОСИТЬ ВЕСЬ ПРОГРЕСС" : "RESET PROFILE DATA"}
                </button>

                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition"
                >
                  {settings.language === "ru" ? "Сохранить и Закрыть" : "Decline and Close"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer copyright */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-600 space-y-1">
        <p>© 2026 Spot the Differences: Cyber & Fantasy Worlds.</p>
        <p className="font-mono text-[10px]">COMPILED WITH PORT 3000 • CAPACITOR READY FOR ANDROID APK</p>
      </footer>

    </div>
  );
}
