/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Cpu, Bot, Network, Zap, Layers, Orbit, Clock, Globe, HelpCircle, HardDrive } from "lucide-react";
import { GameState, Structure } from "../types";
import { formatSci } from "../utils/gameMath";
import { playBuySound } from "../utils/sound";

interface StructuresListProps {
  state: GameState;
  tps: number;
  onBuyStructure: (id: string, amount: number) => void;
  themeColor: string;
}

type QuantityMultiplier = 1 | 10 | 25 | "MAX";

export default function StructuresList({
  state,
  tps,
  onBuyStructure,
  themeColor,
}: StructuresListProps) {
  const [qty, setQty] = useState<QuantityMultiplier>(1);

  // Helper to calculate total cost to purchase N of a building
  const getBulkStats = (str: Structure) => {
    let count = str.count;
    let base = str.baseCost;
    let mult = str.costMultiplier;
    
    // Geometric compounding
    let amountToBuy = 0;
    if (qty === "MAX") {
      let currentNano = state.nanoEnergy;
      let totalCostAccumulator = 0;
      let tempCount = count;
      while (true) {
        const nextCost = base * Math.pow(mult, tempCount);
        if (totalCostAccumulator + nextCost <= currentNano) {
          totalCostAccumulator += nextCost;
          tempCount++;
          amountToBuy++;
        } else {
          break;
        }
        // Prevention for infinite loops
        if (amountToBuy >= 1000) break;
      }
      return {
        amount: Math.max(1, amountToBuy),
        cost: totalCostAccumulator > 0 ? totalCostAccumulator : base * Math.pow(mult, count),
      };
    } else {
      amountToBuy = qty;
      let totalCostAccumulator = 0;
      for (let i = 0; i < amountToBuy; i++) {
        totalCostAccumulator += base * Math.pow(mult, count + i);
      }
      return {
        amount: amountToBuy,
        cost: totalCostAccumulator,
      };
    }
  };

  const renderIcon = (iconName: string, category: string) => {
    const cls = `w-5 h-5`;
    const styleMap: Record<string, string> = {
      nanotech: "text-emerald-400",
      data: "text-cyan-400",
      energy: "text-amber-400",
      space: "text-purple-400",
    };
    const finalCls = `${cls} ${styleMap[category] || "text-slate-300"}`;

    switch (iconName) {
      case "Cpu": return <Cpu className={finalCls} />;
      case "Bot": return <Bot className={finalCls} />;
      case "Network": return <Network className={finalCls} />;
      case "Zap": return <Zap className={finalCls} />;
      case "Layers": return <Layers className={finalCls} />;
      case "Orbit": return <Orbit className={finalCls} />;
      case "Clock": return <Clock className={finalCls} />;
      case "Globe": return <Globe className={finalCls} />;
      default: return <HelpCircle className={finalCls} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#05070a] overflow-hidden">
      {/* Qty multiplier toggle bar */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-950/40 mb-3 select-none">
        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-cyan-500" /> Объем закупки:
        </span>
        <div className="flex bg-[#0d1117] border border-cyan-950/40 rounded-full p-0.5 text-xs font-mono">
          {([1, 10, 25, "MAX"] as QuantityMultiplier[]).map((m) => (
            <button
              key={m}
              onClick={() => setQty(m)}
              className={`px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-colors duration-150 cursor-pointer ${
                qty === m
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-[#8b949e] hover:text-white border border-transparent"
              }`}
            >
              x{m}
            </button>
          ))}
        </div>
      </div>

      {/* Buildings scrolling containment grid */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-slate-200">
        {state.structures.map((str) => {
          const { amount, cost } = getBulkStats(str);
          const isAffordable = state.nanoEnergy >= cost;
          
          // Calculate compound individual TPS
          const baseTps = str.baseProduction * str.count;
          const percentageOfTps = tps > 0 ? (baseTps / tps) * 100 : 0;

          // Buy trigger
          const handlePurchase = () => {
            if (isAffordable) {
              playBuySound();
              onBuyStructure(str.id, amount);
            }
          };

          return (
            <div
              key={str.id}
              onClick={() => isAffordable && handlePurchase()}
              className={`p-3 rounded-2xl border transition-all duration-150 relative overflow-hidden select-none flex flex-col justify-between cursor-pointer ${
                isAffordable
                  ? "bg-[#0d1117] border-cyan-955/40 hover:border-cyan-500/30 shadow-[0_3px_12px_rgba(0,0,0,0.5)] hover:bg-[#10141d] active:scale-[0.99]"
                  : "bg-[#05070a] border-cyan-950/20 opacity-50"
              }`}
            >
              {/* Underlay relative background progress ratio to affordable state */}
              <div 
                className="absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-300 -z-10"
                style={{
                  width: `${Math.min(100, (state.nanoEnergy / cost) * 100)}%`,
                  backgroundColor: `${themeColor}05`,
                }}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#05070a] border border-cyan-950/40 shrink-0">
                    {renderIcon(str.icon, str.category)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5 leading-tight">
                      <span className="text-sm font-bold text-slate-100">{str.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-[#1a2130] px-1.5 py-0.5 rounded">
                        {str.count}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 leading-snug max-w-[195px] truncate mt-0.5">
                      {str.description}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end whitespace-nowrap leading-none">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {formatSci(cost)} <span className="text-[9px] text-[#8b949e] font-normal">HЭ</span>
                  </span>
                  <span className="text-[9px] text-[#8b949e] mt-1 font-mono">
                    +{formatSci(str.baseProduction)} HЭ/с
                  </span>
                </div>
              </div>

              {/* Individual structural summary footer */}
              {str.count > 0 && (
                <div className="mt-2 pt-1 border-t border-cyan-950/30 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>Общая выработка в цепи:</span>
                  <span className="text-slate-400 font-bold font-sans">
                    +{formatSci(baseTps)} HЭ/с ({percentageOfTps.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
