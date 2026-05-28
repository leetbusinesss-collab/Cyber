/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Smartphone, Zap, Server, Cpu, Shield, Orbit, Volume2, Info, RefreshCw, Sparkles, X, FileCode } from "lucide-react";

import { Faction, GameState, Structure, Upgrade, Protocol } from "./types";
import {
  DEFAULT_STRUCTURES,
  DEFAULT_UPGRADES,
  DEFAULT_PROTOCOLS,
  INITIAL_GAME_STATE,
} from "./data/gameStateDefaults";
import {
  calculateTPS,
  calculateClickPower,
  getPendingCores,
  formatSci,
} from "./utils/gameMath";

// Component imports
import AndroidFrame from "./components/AndroidFrame";
import QuantumNexus from "./components/QuantumNexus";
import StructuresList from "./components/StructuresList";
import UpgradesList from "./components/UpgradesList";
import FactionSelect from "./components/FactionSelect";
import TranscendenceScreen from "./components/TranscendenceScreen";
import SavesHub from "./components/SavesHub";

type TabId = "nexus" | "structures" | "upgrades" | "factions" | "singularity";

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [activeTab, setActiveTab] = useState<TabId>("nexus");
  const [protocols, setProtocols] = useState<Protocol[]>(DEFAULT_PROTOCOLS);
  
  // Test & save hub panel state
  const [isSaveHubOpen, setIsSaveHubOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Offline welcome dialog state
  const [offlineStats, setOfflineStats] = useState<{
    seconds: number;
    earned: number;
  } | null>(null);

  // Stats for the passive AI click timeout
  const [secondsSinceLastClick, setSecondsSinceLastClick] = useState(0);

  // References to keep ticking reliable
  const stateRef = useRef(state);
  stateRef.current = state;
  const protocolsRef = useRef(protocols);
  protocolsRef.current = protocols;

  // 1. Initial State Loading & Storage Sync
  useEffect(() => {
    const saved = localStorage.getItem("cyber_realm_idle_save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameState;
        
        // Ensure defaults merge on app updates
        const mergedStructures = DEFAULT_STRUCTURES.map((defStr) => {
          const match = parsed.structures.find((s) => s.id === defStr.id);
          return match ? { ...defStr, count: match.count } : defStr;
        });

        const mergedUpgrades = DEFAULT_UPGRADES.map((defUpg) => {
          const match = parsed.upgrades.find((u) => u.id === defUpg.id);
          return match
            ? { ...defUpg, isUnlocked: match.isUnlocked, isPurchased: match.isPurchased }
            : defUpg;
        });

        // Calculate offline progress
        const now = Date.now();
        const deltaMs = now - parsed.lastTick;
        const deltaSec = Math.floor(deltaMs / 1000);

        const tempState: GameState = {
          ...parsed,
          structures: mergedStructures,
          upgrades: mergedUpgrades,
          lastTick: now,
        };

        // If offline for more than 15 seconds, calculate passive production
        if (deltaSec > 15) {
          const simulatedTps = calculateTPS(tempState, DEFAULT_PROTOCOLS, deltaSec);
          const earned = simulatedTps * deltaSec;
          
          tempState.nanoEnergy += earned;
          tempState.stats.totalEnergyEarned += earned;
          tempState.stats.timePlayed += deltaSec;
          tempState.stats.timeThisTranscending += deltaSec;

          setOfflineStats({
            seconds: deltaSec,
            earned: earned,
          });
        }

        setState(tempState);
      } catch (e) {
        console.error("Failed to load game save", e);
        setState(INITIAL_GAME_STATE);
      }
    } else {
      setState(INITIAL_GAME_STATE);
    }
  }, []);

  // Sync automated dismiss of toasts / debug logs
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // 2. Active Game Engine Ticker (Runs smoothly at 10 ticks per second)
  useEffect(() => {
    const tickInterval = 100; // 100ms
    const interval = setInterval(() => {
      const currentState = stateRef.current;
      const currentProtocols = protocolsRef.current;
      const now = Date.now();

      // Delta simulation in seconds (usually 0.1s)
      const deltaSec = (now - currentState.lastTick) / 1000;
      if (deltaSec <= 0) return;

      // Unlocks faction-specific technology upgrades if state satisfies criteria
      let nextUpgrades = [...currentState.upgrades];
      if (currentState.currentFaction !== Faction.NEUTRAL) {
        nextUpgrades = nextUpgrades.map((u) => {
          if (u.factionLock === currentState.currentFaction) {
            return { ...u, isUnlocked: true };
          }
          return u;
        });
      }

      // Decrement Protocol timers
      const nextProtocols = currentProtocols.map((p) => {
        let activeTimeLeft = p.activeTimeLeft;
        let cooldownLeft = p.cooldownLeft;

        if (activeTimeLeft > 0) {
          activeTimeLeft = Math.max(0, activeTimeLeft - deltaSec);
        }
        if (cooldownLeft > 0) {
          cooldownLeft = Math.max(0, cooldownLeft - deltaSec);
        }

        return { ...p, activeTimeLeft, cooldownLeft };
      });
      setProtocols(nextProtocols);

      // Increment AI idle timer
      setSecondsSinceLastClick((prev) => prev + deltaSec);

      // Calculate automated speed/TPS
      const tps = calculateTPS(currentState, nextProtocols, secondsSinceLastClick);
      const productionEarned = tps * deltaSec;

      // Passive Faction Points accumulation inside alignments
      let factionPointsEarned = 0;
      if (currentState.currentFaction !== Faction.NEUTRAL) {
        const totalBuildings = currentState.structures.reduce((acc, curr) => acc + curr.count, 0);
        // Generates +0.1 Faction Points/sec per building owned
        factionPointsEarned = totalBuildings * 0.1 * deltaSec;
      }

      // Assemble next tick game state
      const nextState: GameState = {
        ...currentState,
        nanoEnergy: currentState.nanoEnergy + productionEarned,
        factionPoints: currentState.factionPoints + factionPointsEarned,
        upgrades: nextUpgrades,
        stats: {
          ...currentState.stats,
          totalEnergyEarned: currentState.stats.totalEnergyEarned + productionEarned,
          timePlayed: currentState.stats.timePlayed + deltaSec,
          timeThisTranscending: currentState.stats.timeThisTranscending + deltaSec,
        },
        lastTick: now,
      };

      // Simulated auto-clicks for Rebel hyper-warp protocol (30 clicks/sec)
      const isRebelWarpActive = nextProtocols.some((p) => p.id === "pr_hyperwarp" && p.activeTimeLeft > 0);
      if (isRebelWarpActive) {
        const virtualClicks = 30 * deltaSec; // 3 clicks per 100ms
        const clickPower = calculateClickPower(currentState, tps, nextProtocols);
        const autoClickEarned = virtualClicks * clickPower;

        nextState.nanoEnergy += autoClickEarned;
        nextState.stats.totalEnergyEarned += autoClickEarned;
        nextState.stats.totalClicks += virtualClicks;
        nextState.stats.clicksThisTranscending += virtualClicks;
      }

      setState(nextState);

      // Save state to local storage every 5 seconds (50 ticks)
      if (Math.random() < 0.15) {
        localStorage.setItem("cyber_realm_idle_save", JSON.stringify(nextState));
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, [secondsSinceLastClick]);

  // 3. Game Action Controllers

  // Handle Nexus Manual Click
  const handleManualClick = (multi: number) => {
    setSecondsSinceLastClick(0); // Reset AI idle tier timeout

    const currentState = stateRef.current;
    const currentProtocols = protocolsRef.current;
    const tps = calculateTPS(currentState, currentProtocols, 0);
    const power = calculateClickPower(currentState, tps, currentProtocols) * multi;

    // Faction point accumulation for active Syndicate with upg_synd_1
    let syncFactionPoints = 0;
    if (currentState.currentFaction === Faction.SYNDICATE && currentState.upgrades.some(u => u.id === "upg_synd_1" && u.isPurchased)) {
      syncFactionPoints = 1.0;
    }

    setState((prev) => ({
      ...prev,
      nanoEnergy: prev.nanoEnergy + power,
      factionPoints: prev.factionPoints + syncFactionPoints,
      stats: {
        ...prev.stats,
        totalClicks: prev.stats.totalClicks + 1,
        clicksThisTranscending: prev.stats.clicksThisTranscending + 1,
        totalEnergyEarned: prev.stats.totalEnergyEarned + power,
      },
    }));
  };

  // Buy Structure Command
  const handleBuyStructure = (id: string, amount: number) => {
    setState((prev) => {
      // Find structure
      const nextStructures = prev.structures.map((str) => {
        if (str.id === id) {
          return { ...str, count: str.count + amount };
        }
        return str;
      });

      // Compute exact pricing manually
      const targetStr = prev.structures.find((s) => s.id === id)!;
      let costSum = 0;
      for (let i = 0; i < amount; i++) {
        costSum += targetStr.baseCost * Math.pow(targetStr.costMultiplier, targetStr.count + i);
      }

      return {
        ...prev,
        nanoEnergy: Math.max(0, prev.nanoEnergy - costSum),
        structures: nextStructures,
      };
    });
  };

  // Buy Technology Upgrade
  const handleBuyUpgrade = (id: string) => {
    setState((prev) => {
      const upgrade = prev.upgrades.find((u) => u.id === id)!;
      const nextUpgrades = prev.upgrades.map((u) => {
        if (u.id === id) {
          return { ...u, isPurchased: true };
        }
        return u;
      });

      if (upgrade.currency === "cores") {
        return {
          ...prev,
          singularityCores: prev.singularityCores - upgrade.cost,
          upgrades: nextUpgrades,
        };
      } else {
        return {
          ...prev,
          nanoEnergy: prev.nanoEnergy - upgrade.cost,
          upgrades: nextUpgrades,
        };
      }
    });
  };

  // Select Faction Agreement Alley
  const handleAlignFaction = (faction: Faction) => {
    setState((prev) => {
      // Dynamic start faction bonus from Core upgrade 3 (+500 Faction points)
      const hasBonusPoints = prev.upgrades.some((u) => u.id === "upg_core_3" && u.isPurchased);
      return {
        ...prev,
        currentFaction: faction,
        factionPoints: prev.factionPoints + (hasBonusPoints ? 500 : 0),
      };
    });
    setActiveTab("nexus");
  };

  // Trigger Protocol Action Spell
  const handleTriggerProtocol = (id: string) => {
    const targetPr = protocols.find((p) => p.id === id)!;

    setState((prev) => ({
      ...prev,
      nanoEnergy: Math.max(0, prev.nanoEnergy - targetPr.cost),
    }));

    setProtocols((prevPr) =>
      prevPr.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            activeTimeLeft: p.duration,
            cooldownLeft: p.cooldown,
          };
        }
        return p;
      })
    );
  };

  // Perform Great Transcendence Reset
  const handleTranscend = () => {
    const energyEarned = state.stats.totalEnergyEarned;
    const pendingCores = getPendingCores(energyEarned);

    setState((prev) => {
      // Reset structures to zero count
      const resetStructures = prev.structures.map((s) => ({ ...s, count: 0 }));

      // Reset Standard & Faction upgrades to unpurchased, lock Faction-specific ones
      const resetUpgrades = prev.upgrades.map((u) => {
        if (u.currency === "cores") {
          return u; // Permanent Cores Upgrades survive Reset!
        }
        return {
          ...u,
          isPurchased: false,
          isUnlocked: !u.factionLock, // Hide/Lock Faction upgrades
        };
      });

      return {
        ...prev,
        nanoEnergy: 0,
        singularityCores: prev.singularityCores + pendingCores,
        factionPoints: 0,
        currentFaction: Faction.NEUTRAL,
        structures: resetStructures,
        upgrades: resetUpgrades,
        stats: {
          ...prev.stats,
          totalEnergyEarned: 0, // Reset run counter for pending cores
          transcendCount: prev.stats.transcendCount + 1,
          clicksThisTranscending: 0,
          timeThisTranscending: 0,
        },
        lastTick: Date.now(),
      };
    });

    // Reset protocols cooldowns and active state
    setProtocols(DEFAULT_PROTOCOLS);
    setActiveTab("nexus");
  };

  // Reset entire Profile (Wipe Save)
  const handleHardWipe = () => {
    if (window.confirm("Вы уверены, что хотите полностью стереть профиль? Весь ваш прогресс будет безвозвратно утерян!")) {
      localStorage.removeItem("cyber_realm_idle_save");
      setState(INITIAL_GAME_STATE);
      setProtocols(DEFAULT_PROTOCOLS);
      setActiveTab("nexus");
    }
  };

  // Load specialized preset game states for sandbox testing
  const handleLoadPreset = (presetIndex: number) => {
    let nextState: GameState;
    if (presetIndex === 0) {
      // Preset 1: Diplomacy Start (25,000 Nano-Energy, 1 Singularity Core)
      nextState = {
        ...INITIAL_GAME_STATE,
        nanoEnergy: 25000,
        singularityCores: 1,
        lastTick: Date.now(),
      };
    } else if (presetIndex === 1) {
      // Preset 2: Extended Network (5M Nano-energy, 15 Singularity Cores)
      nextState = {
        ...INITIAL_GAME_STATE,
        nanoEnergy: 5000000,
        singularityCores: 15,
        structures: INITIAL_GAME_STATE.structures.map((str) => {
          if (str.id === "str_node") return { ...str, count: 12 };
          if (str.id === "str_drone") return { ...str, count: 5 };
          if (str.id === "str_grid") return { ...str, count: 2 };
          return str;
        }),
        lastTick: Date.now(),
      };
    } else {
      // Preset 3: Cosmic Super-AI Overmind (9.9 Trillion Nano-energy, 1000 cores)
      nextState = {
        ...INITIAL_GAME_STATE,
        nanoEnergy: 9876543210000,
        singularityCores: 1000,
        structures: INITIAL_GAME_STATE.structures.map((str) => {
          if (str.id === "str_node") return { ...str, count: 150 };
          if (str.id === "str_drone") return { ...str, count: 80 };
          if (str.id === "str_grid") return { ...str, count: 45 };
          if (str.id === "str_reactor") return { ...str, count: 25 };
          if (str.id === "str_transmuter") return { ...str, count: 15 };
          if (str.id === "str_singularity") return { ...str, count: 8 };
          if (str.id === "str_chronos") return { ...str, count: 4 };
          if (str.id === "str_dyson") return { ...str, count: 1 };
          return str;
        }),
        lastTick: Date.now(),
      };
    }

    setState(nextState);
    localStorage.setItem("cyber_realm_idle_save", JSON.stringify(nextState));
    setProtocols(DEFAULT_PROTOCOLS);
    setToast({
      message: `Загружен пресет №${presetIndex + 1}. Баланс сил изменен!`,
      type: "success",
    });
  };

  // Safe save-file syntax checking and state merging
  const handleImportSaveState = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && typeof parsed === "object") {
        const nextState: GameState = {
          ...INITIAL_GAME_STATE,
          nanoEnergy: typeof parsed.nanoEnergy === "number" ? parsed.nanoEnergy : INITIAL_GAME_STATE.nanoEnergy,
          singularityCores: typeof parsed.singularityCores === "number" ? parsed.singularityCores : INITIAL_GAME_STATE.singularityCores,
          factionPoints: typeof parsed.factionPoints === "number" ? parsed.factionPoints : INITIAL_GAME_STATE.factionPoints,
          currentFaction: Object.values(Faction).includes(parsed.currentFaction) ? parsed.currentFaction : INITIAL_GAME_STATE.currentFaction,
          lastTick: Date.now(),
        };

        if (Array.isArray(parsed.structures)) {
          nextState.structures = INITIAL_GAME_STATE.structures.map((defStr) => {
            const match = parsed.structures.find((s: any) => s && s.id === defStr.id);
            return match ? { ...defStr, count: typeof match.count === "number" ? match.count : defStr.count } : defStr;
          });
        }

        if (Array.isArray(parsed.upgrades)) {
          nextState.upgrades = INITIAL_GAME_STATE.upgrades.map((defUpg) => {
            const match = parsed.upgrades.find((u: any) => u && u.id === defUpg.id);
            return match
              ? {
                  ...defUpg,
                  isUnlocked: typeof match.isUnlocked === "boolean" ? match.isUnlocked : defUpg.isUnlocked,
                  isPurchased: typeof match.isPurchased === "boolean" ? match.isPurchased : defUpg.isPurchased,
                }
              : defUpg;
          });
        }

        if (parsed.stats && typeof parsed.stats === "object") {
          nextState.stats = {
            ...INITIAL_GAME_STATE.stats,
            ...parsed.stats,
          };
        }

        setState(nextState);
        localStorage.setItem("cyber_realm_idle_save", JSON.stringify(nextState));
        setProtocols(DEFAULT_PROTOCOLS);
        setToast({
          message: "Локальный профиль квантового синхро-потока успешно восстановлен!",
          type: "success"
        });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    setToast({
      message: "Ошибка валидации. Нарушена структура кодирования сейв-файла.",
      type: "error"
    });
    return false;
  };

  // Fine-tweak specific resources for live debugging/testing in UI
  const handleModifyResource = (type: "energy" | "cores" | "points", value: number, setRaw: boolean = false) => {
    setState((prev) => {
      let nextState = { ...prev };
      if (type === "energy") {
        nextState.nanoEnergy = setRaw ? value : Math.max(0, prev.nanoEnergy + value);
        if (!setRaw && value > 0) nextState.stats.totalEnergyEarned += value;
      } else if (type === "cores") {
        nextState.singularityCores = setRaw ? value : Math.max(0, prev.singularityCores + value);
        if (!setRaw && value > 0) nextState.stats.totalCoresEarned += value;
      } else if (type === "points") {
        nextState.factionPoints = setRaw ? value : Math.max(0, prev.factionPoints + value);
      }

      localStorage.setItem("cyber_realm_idle_save", JSON.stringify(nextState));
      return nextState;
    });

    setToast({
      message: `Ресурсы изменены. Текущий баланс обновлен!`,
      type: "info"
    });
  };

  // 4. GUI helpers

  // Color theme mapper depending on aligned faction
  const getFactionColors = (): { main: string; glow: string; text: string } => {
    switch (state.currentFaction) {
      case Faction.SYNDICATE:
        return { main: "#10b981", glow: "rgba(16,185,129,0.3)", text: "text-emerald-400" };
      case Faction.SINGULARITY_AI:
        return { main: "#06b6d4", glow: "rgba(6,182,212,0.3)", text: "text-cyan-400" };
      case Faction.REBEL_NOMADS:
        return { main: "#f43f5e", glow: "rgba(244,63,94,0.3)", text: "text-rose-500" };
      default:
        return { main: "#3b82f6", glow: "rgba(59,130,246,0.2)", text: "text-blue-500" };
    }
  };

  const colors = getFactionColors();
  const currentTPS = calculateTPS(state, protocols, secondsSinceLastClick);
  const clickPower = calculateClickPower(state, currentTPS, protocols);

  // Filter Protocols depending on Neutrals or faction matching the faction lock
  const visibleProtocols = protocols.filter(
    (p) => !p.factionLock || p.factionLock === state.currentFaction
  );

  return (
    <AndroidFrame currentFactionColor={colors.main}>
      {toast && (
        <div 
          className="absolute top-14 left-4 right-4 z-[9999] bg-[#0c1017]/95 border border-cyan-800/20 border-l-4 text-slate-200 px-3.5 py-2.5 rounded-r-2xl shadow-[0_4px_24px_rgba(0,0,0,0.85)] flex justify-between items-center text-[10.5px] font-mono leading-snug animate-fadeIn" 
          style={{ borderLeftColor: toast.type === "success" ? "#10b981" : toast.type === "error" ? "#f43f5e" : "#06b6d4" }}
        >
          <div className="pr-2 select-none">
            <div className={`font-bold uppercase tracking-wider text-[8px] mb-0.5 ${toast.type === "success" ? "text-emerald-400" : toast.type === "error" ? "text-rose-400" : "text-cyan-400"}`}>
              {toast.type === "success" ? "ИМПОРТ // УСПЕХ" : toast.type === "error" ? "ОШИБКА ДЕКОДЕРА" : "ОТЛАДКА // РЕСУРСЫ"}
            </div>
            <div>{toast.message}</div>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white transition-colors cursor-pointer p-0.5 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upper Status HUD Dashboard */}
      <div className="bg-[#0d1117] px-4 py-3 select-none border-b border-cyan-950/40 flex justify-between items-center text-slate-200">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase leading-none">
            Баланс Материи (HЭ)
          </div>
          <h2 className="text-xl font-bold font-mono tracking-wide flex items-center gap-1 mt-0.5 text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
            {formatSci(state.nanoEnergy)} 
          </h2>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] text-[#8b949e] font-mono uppercase leading-none mb-1">Фракция</div>
          {state.currentFaction === Faction.NEUTRAL ? (
            <span className="text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full bg-cyan-950/20 uppercase font-bold tracking-widest animate-pulse">
              Нейтрал
            </span>
          ) : (
            <span 
              className="text-[10px] font-mono border px-2 py-0.5 rounded-full uppercase font-bold tracking-widest"
              style={{
                color: colors.main,
                borderColor: `${colors.main}50`,
                backgroundColor: `${colors.main}0a`,
              }}
            >
              {state.currentFaction === Faction.SYNDICATE
                ? "Синдикат"
                : state.currentFaction === Faction.SINGULARITY_AI
                ? "Иерарх ИИ"
                : "Кочевник"}
            </span>
          )}

          {/* Display Faction Points if aligned to a faction */}
          {state.currentFaction !== Faction.NEUTRAL && (
            <div className="text-[9px] font-mono text-slate-400 mt-1">
              ОФ: {state.factionPoints.toFixed(0)}
            </div>
          )}
        </div>
      </div>

      {/* Primary Tab Viewport Panel */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-[#05070a]">
        {activeTab === "nexus" && (
          <QuantumNexus
            state={state}
            tps={currentTPS}
            clickPower={clickPower}
            onManualClick={handleManualClick}
            protocols={visibleProtocols}
            onTriggerProtocol={handleTriggerProtocol}
            themeColor={colors.main}
          />
        )}

        {activeTab === "structures" && (
          <StructuresList
            state={state}
            tps={currentTPS}
            onBuyStructure={handleBuyStructure}
            themeColor={colors.main}
          />
        )}

        {activeTab === "upgrades" && (
          <UpgradesList
            state={state}
            onBuyUpgrade={handleBuyUpgrade}
            themeColor={colors.main}
          />
        )}

        {activeTab === "factions" && (
          <FactionSelect
            state={state}
            onAlignFaction={handleAlignFaction}
          />
        )}

        {activeTab === "singularity" && (
          <TranscendenceScreen
            state={state}
            onTranscend={handleTranscend}
            themeColor={colors.main}
          />
        )}
      </div>

      {/* Screen Bottom Navigation Switch Tab Bar */}
      <div className="bg-[#0d1117] border-t border-cyan-900/30 grid grid-cols-5 p-1 text-slate-400 select-none z-20">
        <button
          onClick={() => setActiveTab("nexus")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "nexus" ? `${colors.text} bg-cyan-950/30 font-bold border border-cyan-500/20` : "hover:text-slate-200"
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-mono tracking-tight uppercase">Нексус</span>
        </button>

        <button
          onClick={() => setActiveTab("structures")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "structures" ? `${colors.text} bg-cyan-950/30 font-bold border border-cyan-500/20` : "hover:text-slate-200"
          }`}
        >
          <Server className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-mono tracking-tight uppercase">Секторы</span>
        </button>

        <button
          onClick={() => setActiveTab("upgrades")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "upgrades" ? `${colors.text} bg-cyan-950/30 font-bold border border-cyan-500/20` : "hover:text-slate-200"
          }`}
        >
          <Cpu className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-mono tracking-tight uppercase">Наука</span>
        </button>

        <button
          onClick={() => setActiveTab("factions")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "factions" ? `${colors.text} bg-cyan-950/30 font-bold border border-cyan-500/20` : "hover:text-slate-200"
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-mono tracking-tight uppercase">Союз</span>
        </button>

        <button
          onClick={() => setActiveTab("singularity")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "singularity" ? `${colors.text} bg-cyan-950/30 font-bold border border-cyan-500/20` : "hover:text-slate-200"
          }`}
        >
          <Orbit className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-mono tracking-tight uppercase">Ядро</span>
        </button>
      </div>

      {/* Side Tools Dashboard Column */}
      <div className="absolute top-28 -left-[2px] z-50 select-none flex flex-col gap-1.5">
        <button
          onClick={handleHardWipe}
          className="bg-rose-950/20 hover:bg-rose-950/40 text-rose-500 hover:text-rose-450 border border-rose-950/30 border-l-none pl-1.5 pr-2.5 py-1.5 rounded-r-xl transition-colors duration-150 text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 cursor-pointer shadow-md shadow-black/80"
          title="Сбросит весь профиль локально"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Сброс
        </button>
        <button
          onClick={() => setIsSaveHubOpen(true)}
          className="bg-cyan-950/30 hover:bg-cyan-900/45 text-cyan-400 hover:text-cyan-300 border border-cyan-950/40 border-l-none pl-1.5 pr-2.5 py-1.5 rounded-r-xl transition-colors duration-150 text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 cursor-pointer shadow-md shadow-black/80"
          title="Панель тестирования: импорт/экспорт сейв-файлов"
        >
          <FileCode className="w-3.5 h-3.5" /> Сейв-Хаб
        </button>
      </div>

      {/* Interactive Save States/Cheats Hub Drawer overlay */}
      <SavesHub
        isOpen={isSaveHubOpen}
        onClose={() => setIsSaveHubOpen(false)}
        gameState={state}
        onReset={handleHardWipe}
        onImportSaveState={handleImportSaveState}
        onModifyResource={handleModifyResource}
        onLoadPreset={handleLoadPreset}
      />

      {/* Offline progress welcoming popup dialog module */}
      {offlineStats && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="w-full max-w-[320px] bg-[#0d1117] border border-cyan-900/60 rounded-[32px] p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3 border border-cyan-500/20 border-dotted animate-spin" style={{ animationDuration: "10s" }}>
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-black font-mono tracking-wider text-slate-100 uppercase">
              Синхронизация Прогресса
            </h3>
            
            <p className="text-[10px] text-slate-400 mt-2 font-mono leading-relaxed">
              Квантовые контуры были активны во время автономного режима в течение{" "}
              <strong className="text-slate-100">{(offlineStats.seconds / 60).toFixed(1)}</strong> минут.
            </p>

            <div className="my-4 w-full bg-[#05070a] border border-cyan-900/30 rounded-2xl p-3">
              <span className="text-[8px] font-mono uppercase text-[#8b949e] block">Добыто энергии (HЭ)</span>
              <span className="text-lg font-bold text-cyan-400 font-mono tracking-wide mt-1 block">
                +{formatSci(offlineStats.earned)}
              </span>
            </div>

            <button
              onClick={() => setOfflineStats(null)}
              className="w-full bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 hover:text-cyan-200 border border-cyan-500/30 rounded-xl py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer"
            >
              Интегрировать Буфер
            </button>
          </div>
        </div>
      )}
    </AndroidFrame>
  );
}
