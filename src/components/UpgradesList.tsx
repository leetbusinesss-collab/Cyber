/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Award, Layers, ShieldCheck, Zap, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { GameState, Upgrade } from "../types";
import { formatSci } from "../utils/gameMath";
import { playBuySound } from "../utils/sound";

interface UpgradesListProps {
  state: GameState;
  onBuyUpgrade: (id: string) => void;
  themeColor: string;
}

type FilterType = "ALL" | "GENERAL" | "FACTION" | "CORES";

export default function UpgradesList({
  state,
  onBuyUpgrade,
  themeColor,
}: UpgradesListProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [showPurchased, setShowPurchased] = useState(false);

  // Filter upgrades according to selection
  const filteredUpgrades = state.upgrades.filter((u) => {
    // 1. Filter out upgrades from other factions entirely
    if (u.factionLock && u.factionLock !== state.currentFaction) {
      return false;
    }

    // 2. Already purchased filtering
    if (u.isPurchased) {
      if (!showPurchased) return false;
    }

    // 3. Tab filter
    if (filter === "GENERAL") {
      return u.currency === "energy" && !u.factionLock;
    }
    if (filter === "FACTION") {
      return !!u.factionLock;
    }
    if (filter === "CORES") {
      return u.currency === "cores";
    }

    return true;
  });

  // Sort upgrades: affordable first, then cost
  const sortedUpgrades = [...filteredUpgrades].sort((a, b) => {
    const isAAffordable =
      a.currency === "cores"
        ? state.singularityCores >= a.cost
        : state.nanoEnergy >= a.cost;
    const isBAffordable =
      b.currency === "cores"
        ? state.singularityCores >= b.cost
        : state.nanoEnergy >= b.cost;

    if (isAAffordable && !isBAffordable) return -1;
    if (!isAAffordable && isBAffordable) return 1;
    return a.cost - b.cost;
  });

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#05070a] overflow-hidden">
      {/* Category Selection Filter Line */}
      <div className="flex bg-[#0d1117] border border-cyan-950/40 rounded-xl p-1 justify-between select-none text-[10px] font-mono mb-2">
        {([
          { id: "ALL", label: "Все" },
          { id: "GENERAL", label: "Общие" },
          { id: "FACTION", label: "Фракция" },
          { id: "CORES", label: "Ядра" },
        ] as { id: FilterType; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-1 rounded-lg text-center font-bold transition-all duration-150 cursor-pointer ${
              filter === tab.id
                ? "bg-[#05070a] border border-cyan-950/40 text-cyan-300 shadow-inner"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Show Purchased Toggle Switch */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-950/40 mb-3 select-none">
        <span className="text-[10px] font-mono text-slate-400 uppercase">
          Показывать приобретенные модули:
        </span>
        <button
          onClick={() => setShowPurchased(!showPurchased)}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-300"
        >
          {showPurchased ? (
            <ToggleRight className="w-6 h-6 text-cyan-400" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-500" />
          )}
        </button>
      </div>

      {/* Upgrades Scrolling Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-slate-200">
        {sortedUpgrades.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono">
            <Award className="w-10 h-10 text-slate-700 mb-2 animate-pulse" />
            <span className="text-xs">Доступных технологий не обнаружено.</span>
            <span className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
              {filter === "FACTION" && state.currentFaction === "NEUTRAL"
                ? "Вступите во фракцию в разделе «Фракции» для открытия особых технологий."
                : "Измените настройки фильтра или накопите ресурс."}
            </span>
          </div>
        ) : (
          sortedUpgrades.map((upg) => {
            const isCores = upg.currency === "cores";
            const currentReserve = isCores ? state.singularityCores : state.nanoEnergy;
            const isAffordable = currentReserve >= upg.cost;
            const bgGradient = upg.isPurchased
              ? "bg-[#05070a]/40 border-cyan-950/20 text-slate-500"
              : isAffordable
              ? isCores
                ? "bg-[#180e29] border-purple-650/30 hover:border-purple-500/40 hover:bg-[#1a0f2e]"
                : "bg-[#0d1117] border-cyan-955/40 hover:border-cyan-500/30 hover:bg-[#10141d]"
              : "bg-[#05070a]/40 border-cyan-950/20 opacity-50";

            return (
              <div
                key={upg.id}
                onClick={() => !upg.isPurchased && isAffordable && onBuyUpgrade(upg.id)}
                className={`p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between cursor-pointer select-none relative overflow-hidden ${bgGradient}`}
              >
                {/* Micro glow badge of faction lock status */}
                {upg.factionLock && (
                  <div className="absolute top-0 right-0 py-0.5 px-2 bg-gradient-to-r from-red-500 to-amber-500 text-[8px] font-bold font-mono tracking-widest text-[#000] uppercase rounded-bl">
                    Фракционный
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 leading-tight">
                        <span className={`text-xs font-bold ${upg.isPurchased ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {upg.name}
                        </span>
                        {upg.isPurchased && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <span className="text-[9.5px] text-slate-400 leading-snug mt-1 max-w-[195px] truncate">
                        {upg.description}
                      </span>
                    </div>
                  </div>

                  {/* Currencies specific cost tags */}
                  <div className="text-right flex flex-col items-end shrink-0 select-none">
                    {upg.isPurchased ? (
                      <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold tracking-wider">
                        Приобретен
                      </span>
                    ) : (
                      <>
                        <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isCores ? "text-purple-400" : "text-cyan-400"}`}>
                          {isCores && <Sparkles className="w-3 h-3 text-purple-400" />}
                          {formatSci(upg.cost)}
                          <span className="text-[9px] font-normal text-slate-400 uppercase">
                            {isCores ? "ЯС" : "HЭ"}
                          </span>
                        </span>
                        <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-tight mt-1">
                          {upg.effect}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
