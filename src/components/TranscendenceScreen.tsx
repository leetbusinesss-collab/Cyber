/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Orbit, Award, AlertTriangle, ShieldCheck, HelpCircle, FlameKindling, Info, Sparkles } from "lucide-react";
import { GameState } from "../types";
import { formatSci, formatTime, getPendingCores, getEnergyForNextCore, isPurchased } from "../utils/gameMath";
import { playPrestigeSound } from "../utils/sound";

interface TranscendenceScreenProps {
  state: GameState;
  onTranscend: () => void;
  themeColor: string;
}

export default function TranscendenceScreen({
  state,
  onTranscend,
  themeColor,
}: TranscendenceScreenProps) {
  const energyEarnedThisRun = state.stats.totalEnergyEarned;
  const pendingCores = getPendingCores(energyEarnedThisRun);
  const nextCoreEnergyReq = getEnergyForNextCore(energyEarnedThisRun);
  const energyNeededForNext = Math.max(0, nextCoreEnergyReq - energyEarnedThisRun);

  // Core multiplier computation (5% basic, 7% with upg_core_1)
  const coreBonusPercent = isPurchased(state, "upg_core_1") ? 7 : 5;
  const currentTotalCoreMultiplier = state.singularityCores * coreBonusPercent;

  const handleTranscendPress = () => {
    if (pendingCores > 0) {
      playPrestigeSound();
      onTranscend();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#05070a] overflow-y-auto pr-1">
      {/* Upper Singularity Core Dashboard */}
      <div 
        className="p-4 rounded-3xl border text-center select-none relative overflow-hidden mb-4"
        style={{
          backgroundColor: `${themeColor}05`,
          borderColor: `${themeColor}22`,
        }}
      >
        <div className="absolute top-1 right-2 animate-pulse">
          <Orbit className="w-12 h-12 text-purple-500/10" />
        </div>

        <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-bold flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Хранилище Космических Ядер
        </span>

        <h2 className="text-3xl font-black font-mono text-purple-400 my-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
          {state.singularityCores}
        </h2>

        <p className="text-[10px] text-slate-300 font-mono">
          Общий бонус к добыче:{" "}
          <strong className="text-purple-300 font-bold">+{currentTotalCoreMultiplier}%</strong> (+{coreBonusPercent}% за ядро)
        </p>
      </div>

      {/* Prestige (Resets) Active Panel */}
      <div className="bg-[#0d1117] border border-cyan-950/40 rounded-3xl p-4 mb-4 select-none relative overflow-hidden">
        <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300 flex items-center gap-1.5 mb-2.5">
          <FlameKindling className="w-4 h-4 text-[#ec4899]" /> Цикл Трансцендентности
        </h4>

        <div className="grid grid-cols-2 gap-3 mb-3 text-center">
          <div className="bg-[#05070a] border border-cyan-950/20 rounded-xl p-2.5">
            <span className="text-[8px] font-mono uppercase text-[#8b949e] block">Очки эпохи</span>
            <span className="text-sm font-bold text-slate-200 block truncate mt-0.5">
              {formatSci(state.nanoEnergy)}
            </span>
          </div>
          <div className="bg-[#05070a] border border-cyan-950/20 rounded-xl p-2.5">
            <span className="text-[8px] font-mono uppercase block text-[#ec4899]">Новые Ядра при сбросе</span>
            <span className="text-sm font-bold text-[#ec4899] block mt-0.5">
              +{pendingCores} ЯС
            </span>
          </div>
        </div>

        {/* Energy requirements for the next prestige core */}
        {pendingCores > 0 && (
          <div className="text-[9px] font-mono text-slate-400 bg-slate-955/60 border border-cyan-950/20 p-2.5 rounded-xl mb-3 leading-snug">
            <div className="flex justify-between font-bold mb-0.5 text-[10px]">
              <span>След. Ядро:</span>
              <span className="text-cyan-400">{formatSci(energyNeededForNext)} HЭ</span>
            </div>
            <span>Развивайте производство сильнее, чтобы забрать больше ядер квантовых фракций за один сброс.</span>
          </div>
        )}

        {pendingCores === 0 ? (
          // Ineligible status warning
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-[9px] text-rose-400 font-mono leading-relaxed">
              <strong className="block text-[10px] text-rose-300 font-bold uppercase mb-0.5">Внимание: Сброс недоступен</strong>
              Недостаточно нано-энергии. Накопите не менее <strong className="text-cyan-400">1.0e6 HЭ</strong> в сумме за текущий цикл, чтобы сформировать первое Космическое Ядро.
            </div>
          </div>
        ) : (
          // Prestige action executable button
          <button
            onClick={handleTranscendPress}
            className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 active:scale-[0.98] text-[#000] hover:text-white border-none py-3 rounded-2xl text-xs font-bold tracking-wider uppercase font-mono transition-all duration-150 cursor-pointer shadow-[0_4px_15px_rgba(236,72,153,0.3)] animate-pulse"
          >
            Запустить Великую Трансцендентность
          </button>
        )}

        {pendingCores > 0 && (
          <p className="text-[8.5px] text-slate-500 text-center font-mono mt-2.5 leading-snug">
            ⚠️ Перезагрузка сбросит вашу Текущую Энергию, Фракцию, Постройки и обычные Улучшения, предоставив Ядра для вечных технологий.
          </p>
        )}
      </div>

      {/* Statistical Logs Table Sheet */}
      <div className="bg-[#0d1117] border border-cyan-950/40 rounded-2xl p-3 font-mono text-[9px] select-none text-slate-300">
        <h4 className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#8b949e] uppercase border-b border-cyan-955/20 pb-2 mb-2">
          <Award className="w-4 h-4 text-cyan-400" /> Статистика Квантовой Личности
        </h4>

        <div className="space-y-1.5 text-[#8b949e]">
          <div className="flex justify-between items-center border-b border-cyan-955/10 pb-1">
            <span className="font-mono text-[9px]">Общее число Трансцендентностей:</span>
            <span className="text-slate-100 font-bold font-mono text-[10px]">{state.stats.transcendCount}</span>
          </div>
          <div className="flex justify-between items-center border-b border-cyan-955/10 pb-1">
            <span className="font-mono text-[9px]">Энергии выработано всего:</span>
            <span className="text-slate-100 font-bold font-mono text-[10px]">{formatSci(energyEarnedThisRun)} HЭ</span>
          </div>
          <div className="flex justify-between items-center border-b border-cyan-955/10 pb-1">
            <span className="font-mono text-[9px]">Ручных кликов зарегистрировано:</span>
            <span className="text-slate-100 font-bold font-mono text-[10px]">{state.stats.totalClicks}</span>
          </div>
          <div className="flex justify-between items-center border-b border-cyan-955/10 pb-1">
            <span className="font-mono text-[9px]">Время в текущем цикле:</span>
            <span className="text-slate-100 font-bold font-mono text-[10px]">{formatTime(state.stats.timeThisTranscending)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px]">Общее время нахождения в сетях:</span>
            <span className="text-slate-100 font-bold font-mono text-[10px]">{formatTime(state.stats.timePlayed)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
