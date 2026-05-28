/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Activity, Network, TrendingUp, ChevronsUp, Flame, Sparkles } from "lucide-react";
import { Faction, GameState, Protocol } from "../types";
import { formatSci } from "../utils/gameMath";
import { playClickSound, playProtocolSound } from "../utils/sound";

interface QuantumNexusProps {
  state: GameState;
  tps: number;
  clickPower: number;
  onManualClick: (multiplier: number) => void;
  protocols: Protocol[];
  onTriggerProtocol: (id: string) => void;
  themeColor: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  amount: string;
}

export default function QuantumNexus({
  state,
  tps,
  clickPower,
  onManualClick,
  protocols,
  onTriggerProtocol,
  themeColor,
}: QuantumNexusProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const nexusRef = useRef<HTMLButtonElement>(null);

  // Click handler to position floating particle indicators
  const handleNexusClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    playClickSound();

    let isLuckyNomadClick = false;
    let actualClickValue = clickPower;

    // Rebel Nomads random lucky multiplier check
    if (state.currentFaction === Faction.REBEL_NOMADS && state.upgrades.some(u => u.id === "upg_reb_1" && u.isPurchased)) {
      if (Math.random() < 0.1) {
        isLuckyNomadClick = true;
        actualClickValue = clickPower * 12;
      }
    }

    onManualClick(isLuckyNomadClick ? 12 : 1);

    // Coordinate floating text relative to click coordinate
    if (nexusRef.current) {
      const rect = nexusRef.current.getBoundingClientRect();
      const clientX = e.clientX || rect.left + rect.width / 2;
      const clientY = e.clientY || rect.top + rect.height / 2;

      const x = clientX - rect.left + (Math.random() * 40 - 20);
      const y = clientY - rect.top + (Math.random() * 20 - 40);

      const id = particleIdRef.current++;
      const text = `+${formatSci(actualClickValue)}${isLuckyNomadClick ? " ×12! ☄️" : ""}`;

      setParticles((prev) => [...prev, { id, x, y, amount: text }]);
    }
  };

  // Auto clean stale particles
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.slice(1));
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  // Determine protocol icons dynamically
  const getProtocolIcon = (iconName: string) => {
    switch (iconName) {
      case "Activity": return <Activity className="w-5 h-5 text-amber-400" />;
      case "Network": return <Network className="w-5 h-5 text-cyan-400" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "ChevronsUp": return <ChevronsUp className="w-5 h-5 text-indigo-400" />;
      case "Flame": return <Flame className="w-5 h-5 text-rose-500 animate-pulse" />;
      default: return <Zap className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 relative overflow-hidden bg-[#05070a]">
      {/* Visual cybernetic HUD telemetry overlay */}
      <div className="absolute top-2 left-4 text-[9px] font-mono text-cyan-500/40 select-none uppercase tracking-widest space-y-0.5">
        <div>NEXUS_MOD: ENG_CELL_STABLE</div>
        <div>GRAVITY_PULL: {(state.singularityCores * 1.5).toFixed(1)}m/s²</div>
      </div>

      <div className="absolute top-2 right-4 text-[9px] font-mono text-cyan-500/40 select-none uppercase tracking-widest text-right">
        <div>CODENAME: NEON_REALM_v1.0</div>
        <div>ACTIVE_FACTION: {state.currentFaction}</div>
      </div>

      {/* Main Clicking Sphere Module */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative">
          {/* Glowing orbital energy ring backdrops */}
          <div 
            className="absolute -inset-8 rounded-full opacity-10 blur-xl animate-spin duration-[40s]"
            style={{ backgroundColor: themeColor }}
          />
          <div 
            className="absolute -inset-4 rounded-full opacity-5 blur-md animate-ping duration-[6s]"
            style={{ border: `2px dashed ${themeColor}` }}
          />

          <button
            ref={nexusRef}
            onClick={handleNexusClick}
            className="relative w-44 h-44 rounded-full bg-[#0d1117] border-2 border-slate-800 flex flex-col items-center justify-center outline-none select-none active:scale-95 transition-transform duration-75 cursor-pointer group"
            style={{
              boxShadow: `inset 0 0 20px ${themeColor}22, 0 0 30px ${themeColor}15`,
              borderColor: `${themeColor}40`,
            }}
          >
            {/* Vector design rotating interface */}
            <svg className="absolute inset-2 w-[90%] h-[90%] animate-spin duration-[25s]" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={`${themeColor}1a`}
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={themeColor}
                strokeWidth="1"
                strokeDasharray="15,10"
                className="opacity-40"
              />
              <path
                d="M 50 15 A 35 35 0 0 1 85 50"
                fill="none"
                stroke={themeColor}
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-70"
              />
              <path
                d="M 50 85 A 35 35 0 0 1 15 50"
                fill="none"
                stroke={themeColor}
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-70"
              />
            </svg>

            {/* Pulsing focal Core */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse z-10 transition-transform duration-200 group-hover:scale-110"
              style={{
                background: `radial-gradient(circle, ${themeColor} 0%, rgba(0,0,0,0.8) 100%)`,
                boxShadow: `0 0 40px ${themeColor}`,
              }}
            >
              <Zap className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>

            {/* Click kinetic instructions */}
            <div className="absolute bottom-8 text-[9px] font-mono tracking-widest text-[#8b949e] select-none z-10 uppercase animate-bounce mt-1">
              [НАЖМИ]
            </div>

            {/* Manual Click floating numbers container */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, scale: 0.8, y: p.y }}
                  animate={{ opacity: 0, scale: 1.2, y: p.y - 120 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  style={{ left: p.x }}
                  className="absolute pointer-events-none text-sm font-black font-mono tracking-tight text-white drop-shadow-[0_2px_10px_rgba(6,182,212,0.8)] z-50 whitespace-nowrap"
                >
                  {p.amount}
                </motion.div>
              ))}
            </AnimatePresence>
          </button>
        </div>

        {/* Real-time statistics HUD bar */}
        <div className="mt-6 w-full max-w-[320px] grid grid-cols-2 gap-2 bg-[#0d1117] border border-cyan-950/40 rounded-2xl p-2.5 font-mono text-[11px] shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-center border-r border-[#1a1f26]">
            <span className="text-slate-500 uppercase text-[9px]">Сила Клика</span>
            <span className="text-white font-bold text-sm tracking-wide mt-0.5">
              +{formatSci(clickPower)} <span className="text-[10px] text-slate-400 font-normal">HЭ</span>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-500 uppercase text-[9px]">Авто-доход (TPS)</span>
            <span className="text-cyan-400 font-bold text-sm tracking-wide mt-0.5">
              +{formatSci(tps)} <span className="text-[10px] text-slate-400 font-normal">HЭ/с</span>
            </span>
          </div>
        </div>
      </div>

      {/* Protocols Launcher Dock */}
      <div className="space-y-2 select-none border border-cyan-950/40 pt-3 bg-[#0d1117] rounded-3xl p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.6)]">
        <h4 className="flex items-center gap-1 text-[10px] font-mono tracking-widest text-[#8b949e] uppercase font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Протоколы Энергии (Спеллы)
        </h4>

        <div className="grid grid-cols-1 gap-2.5 max-h-[145px] overflow-y-auto pr-1">
          {protocols.map((p) => {
            const isAvailable = state.nanoEnergy >= p.cost;
            const isCooldownActive = p.cooldownLeft > 0;
            const isActive = p.activeTimeLeft > 0;

            return (
              <button
                key={p.id}
                disabled={isCooldownActive || (!isActive && !isAvailable)}
                onClick={() => {
                  playProtocolSound();
                  onTriggerProtocol(p.id);
                }}
                className={`relative overflow-hidden w-full text-left rounded-xl border p-2 flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-[#05070a] border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.15)]"
                    : isCooldownActive
                    ? "bg-[#05070a] border-cyan-950/40 opacity-50 cursor-not-allowed"
                    : isAvailable
                    ? "bg-[#05070a] border-cyan-950/40 hover:bg-[#0d1117] active:scale-[0.99]"
                    : "bg-[#05070a] border-cyan-950/20 opacity-60"
                }`}
              >
                {/* Visual duration / cooldown loading progression line */}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(p.activeTimeLeft / p.duration) * 100}%` }}
                  />
                )}
                {isCooldownActive && !isActive && (
                  <div 
                    className="absolute bottom-0 left-0 h-0.5 bg-rose-500/40 transition-all duration-1000 ease-linear"
                    style={{ width: `${(p.cooldownLeft / p.cooldown) * 100}%` }}
                  />
                )}

                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? "bg-yellow-500/10" : "bg-slate-800/20"}`}>
                    {getProtocolIcon(p.icon)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 truncate max-w-[190px]">
                      {p.name}
                    </div>
                    <div className="text-[9px] text-slate-400 leading-tight truncate max-w-[185px]">
                      {p.description}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono flex flex-col items-end shrink-0 min-w-[60px]">
                  {isActive ? (
                    <span className="text-xs text-yellow-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
                      {p.activeTimeLeft.toFixed(0)}с
                    </span>
                  ) : isCooldownActive ? (
                    <span className="text-xs text-rose-400 font-bold">
                      кд {p.cooldownLeft.toFixed(0)}с
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] text-cyan-400 font-bold">Запуск</span>
                      <span className="text-[9px] text-slate-500">{formatSci(p.cost)} HЭ</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
