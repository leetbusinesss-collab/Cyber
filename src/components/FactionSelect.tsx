/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Building2, BrainCircuit, Globe2, Compass, KeyRound, Check } from "lucide-react";
import { Faction, GameState } from "../types";
import { formatSci } from "../utils/gameMath";
import { playBuySound } from "../utils/sound";

interface FactionSelectProps {
  state: GameState;
  onAlignFaction: (faction: Faction) => void;
}

export default function FactionSelect({ state, onAlignFaction }: FactionSelectProps) {
  const isEligible = state.nanoEnergy >= 10000 || state.singularityCores > 0 || state.stats.transcendCount > 0;
  const currentFaction = state.currentFaction;

  const handleAlign = (fact: Faction) => {
    if (isEligible) {
      playBuySound();
      onAlignFaction(fact);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#05070a] overflow-y-auto pr-1">
      {/* Elegantly styled header */}
      <div className="text-center py-2 border-b border-cyan-950/40 mb-4 select-none">
        <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase flex items-center justify-center gap-1.5 font-mono">
          <Compass className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: "12s" }} />
          Альянсы и Фракции
        </h3>
        <p className="text-[9.5px] text-[#8b949e] mt-1 max-w-[280px] mx-auto leading-snug">
          Присоединение к фракциям открывает особые квантовые технологии и мощные активные Спеллы-Протоколы.
        </p>
      </div>

      {!isEligible ? (
        // Block state for low energy
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0d1117] rounded-3xl border border-cyan-955/40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <KeyRound className="w-12 h-12 text-rose-500/80 mb-3 animate-bounce" />
          <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-widest">
            Канал Заблокирован
          </span>
          <span className="text-[10px] text-slate-400 mt-2 max-w-[220px]">
            Чтобы разблокировать фракционную дипломатию, локализуйте хотя бы{" "}
            <strong className="text-cyan-400">10 000 HЭ</strong> в текущем цикле или совершите Трансцендентность.
          </span>
          <div className="mt-4 w-full max-w-[180px] bg-black/60 h-1.5 rounded-full overflow-hidden border border-cyan-900/30">
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (state.nanoEnergy / 10000) * 100)}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-[#8b949e] mt-1.5 uppercase font-bold">
            Прогресс: {formatSci(state.nanoEnergy)} / 10k HЭ
          </span>
        </div>
      ) : currentFaction !== Faction.NEUTRAL ? (
        // UI displayed if already aligned to a faction
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-[#0d1117] border border-cyan-950/40 flex items-center justify-center mb-3 text-cyan-400">
            <Shield className="w-8 h-8 animate-pulse text-cyan-400" />
          </div>
          <span className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">
            Матрица Соглашения Активна
          </span>
          <p className="text-[10px] text-slate-400 mt-2 max-w-[230px] leading-relaxed">
            Ваши сети согласованы с фракцией{" "}
            <strong className="text-cyan-400 uppercase">
              {currentFaction === Faction.SYNDICATE
                ? "Синдикат «Мегакорп»"
                : currentFaction === Faction.SINGULARITY_AI
                ? "Разум Сингулярности"
                : "Кочевники Анархисты"}
            </strong>{" "}
            до конца текущего квантового цикла.
          </p>
          <span className="text-[9px] text-slate-500 font-mono mt-4 uppercase">
            *Сбросить альянс можно при запуске следующей «Трансцендентности».
          </span>
        </div>
      ) : (
        // Choose list
        <div className="space-y-4">
          {/* Card 1: Syndicate */}
          <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-[#0c191a]/40 flex flex-col justify-between transition-all duration-200 hover:border-emerald-500/40 select-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase font-mono tracking-wider">
                  Синдикат «Мегакорп»
                </span>
                <p className="text-[9.5px] leading-snug mt-1 text-slate-400">
                  Индустриальные титаны ценят физическое золото и квантовый капитал. Фокусируются на ручной силе клика и мгновенно-выкупных схемах.
                </p>
                <ul className="text-[8.5px] text-emerald-400/80 font-mono mt-2 space-y-0.5">
                  <li className="flex items-center gap-1">• Скидка -20% на покупку всех построек</li>
                  <li className="flex items-center gap-1">• Сила клика возрастает от количества зданий</li>
                  <li className="flex items-center gap-1">• Протокол «Спекулятивный Рост» дает моментальные 200с дохода</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleAlign(Faction.SYNDICATE)}
              className="mt-3.5 w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-[#000] border border-emerald-500/40 rounded-xl py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer"
            >
              Подписать Контракт Синдиката
            </button>
          </div>

          {/* Card 2: AI Singularity */}
          <div className="p-3.5 rounded-2xl border border-cyan-500/25 bg-[#0c1622]/40 flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/45 select-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-300 uppercase font-mono tracking-wider">
                  Разум Сингулярности (ИИ)
                </span>
                <p className="text-[9.5px] leading-snug mt-1 text-slate-400">
                  Высший автономный разум ИИ, стремящийся к абсолютной вычислительной бесконечности. Фокусируются на пассивном прогрессе и экспоненциальном росте.
                </p>
                <ul className="text-[8.5px] text-cyan-400/80 font-mono mt-2 space-y-0.5">
                  <li className="flex items-center gap-1">• Множитель до +100% за время простоя без кликов</li>
                  <li className="flex items-center gap-1">• Все здания усиливают друг друга на +1.5%</li>
                  <li className="flex items-center gap-1">• Протокол «Алгоритм Синтеза» повышает пассив на +600%</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleAlign(Faction.SINGULARITY_AI)}
              className="mt-3.5 w-full bg-cyan-600/25 hover:bg-cyan-500 text-cyan-400 hover:text-[#000] border border-cyan-500/40 rounded-xl py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer"
            >
              Интегрироваться в Сингулярность
            </button>
          </div>

          {/* Card 3: Nomad Rebels */}
          <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-[#1e0f1e]/40 flex flex-col justify-between transition-all duration-200 hover:border-rose-500/40 select-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-300 uppercase font-mono tracking-wider">
                  Анархо-Кочевники
                </span>
                <p className="text-[9.5px] leading-snug mt-1 text-slate-400">
                  Космические странники, черпающие силу из сингулярной асимметрии и энтропии материи. Делают ставку на случайные сверхмощные всплески и временные петли.
                </p>
                <ul className="text-[8.5px] text-rose-400/80 font-mono mt-2 space-y-0.5">
                  <li className="flex items-center gap-1">• Постоянный шанс 10% получить критический клик х12</li>
                  <li className="flex items-center gap-1">• Каждый ваш ручной клик постоянно ускоряет здания</li>
                  <li className="flex items-center gap-1">• Протокол «Энтропийная Петля» наносит 30 авто-кликов/сек</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleAlign(Faction.REBEL_NOMADS)}
              className="mt-3.5 w-full bg-rose-600/20 hover:bg-rose-500 text-rose-300 hover:text-[#000] border border-rose-500/40 rounded-xl py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer"
            >
              Присягнуть Кодексу Кочевников
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
