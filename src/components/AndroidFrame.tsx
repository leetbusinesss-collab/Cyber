/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Wifi, Battery, Volume2, VolumeX, Smartphone, Info } from "lucide-react";
import { getSoundEnabled, setSoundEnabled } from "../utils/sound";

interface AndroidFrameProps {
  children: React.ReactNode;
  currentFactionColor: string;
}

export default function AndroidFrame({ children, currentFactionColor }: AndroidFrameProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(99);
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [showConfigInfo, setShowConfigInfo] = useState(false);

  useEffect(() => {
    // Simulated clock in the Android status bar
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    // Slowly simulate battery discharge
    const batteryTimer = setInterval(() => {
      setBatteryLevel((prev) => (prev > 55 ? prev - 1 : 100));
    }, 180000);

    return () => {
      clearInterval(timer);
      clearInterval(batteryTimer);
    };
  }, []);

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-[#05070a] bg-scanline flex flex-col items-center justify-center p-2 sm:p-4 selection:bg-cyan-500/30 selection:text-white relative">
      {/* Visual background decor - Elegant Dark ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-cyan-950/20 rounded-full blur-[140px] animate-pulse duration-[12s]" />
        <div className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] bg-fuchsia-950/20 rounded-full blur-[140px] animate-pulse duration-[18s]" />
      </div>

      {/* Cyber smartphone casing */}
      <div 
        className="relative w-full max-w-[420px] aspect-[9/19] bg-[#05070a] rounded-[48px] border-8 border-[#1a1f26] shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10"
        style={{
          boxShadow: `0 0 30px -5px ${currentFactionColor}20, 0 0 120px -20px rgba(0,0,0,0.95), inset 0 0 10px rgba(0, 242, 255, 0.05)`,
        }}
        id="cyber-android-phone-frame"
      >
        {/* Glow bezel divider */}
        <div 
          className="absolute inset-[1px] rounded-[40px] pointer-events-none border border-white/5 z-40"
          style={{ borderColor: `${currentFactionColor}15` }}
        />

        {/* Dynamic Island Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-[#000] rounded-b-[16px] z-50 flex items-center justify-around px-3 selection:bg-transparent">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#1e40af]" />
          </div>
          <div className="w-16 h-1 rounded-full bg-slate-800" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping duration-1500" />
        </div>

        {/* Android Status Bar */}
        <div className="pt-6 px-6 pb-2 bg-[#0d1117] flex justify-between items-center text-[11px] font-mono text-cyan-500/60 select-none z-30 border-b border-cyan-900/40">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold tracking-widest text-[10px] drop-shadow-[0_0_5px_rgba(6,182,212,0.4)]">CYBER-NET</span>
            <Wifi className="w-3.5 h-3.5 text-cyan-400/80" />
          </div>
          <span className="font-bold text-slate-300 ml-4 tracking-wider">{currentTime || "02:30"}</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleSound}
              className="p-1 hover:text-white transition-colors duration-150"
              title="Переключить звук"
            >
              {soundOn ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              )}
            </button>
            <div className="flex items-center gap-1">
              <span className="text-[10px]">{batteryLevel}%</span>
              <Battery className="w-3.5 h-3.5 text-cyan-400/70" />
            </div>
          </div>
        </div>

        {/* Interactive Phone Screen Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-[#080a0e]">
          {children}
        </div>

        {/* Bottom Navigation gesture bar */}
        <div className="h-6 bg-[#0d1117] flex justify-center items-center select-none z-30 relative border-t border-cyan-900/40">
          <div className="w-28 h-1 bg-slate-800 rounded-full hover:bg-cyan-500/60 transition-colors duration-200 cursor-pointer" />
        </div>
      </div>

      {/* External instructions */}
      <div className="mt-4 text-center max-w-[420px] text-xs text-slate-500 font-mono tracking-tight leading-relaxed z-10">
        <p className="flex items-center justify-center gap-1 text-slate-400">
          <Smartphone className="w-4 h-4 text-cyan-500" />
          Режим Мобильного Сенсора Активен
        </p>
        <button 
          onClick={() => setShowConfigInfo(!showConfigInfo)}
          className="mt-2 text-cyan-500/80 hover:text-cyan-400 underline font-semibold flex items-center justify-center gap-1 mx-auto"
        >
          <Info className="w-3 h-3" /> Справка по геймплею
        </button>

        {showConfigInfo && (
          <div className="mt-2 p-3 bg-[#0d1117] border border-cyan-900/30 text-left text-xs space-y-2 text-slate-400 animate-fadeIn shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <p><strong>Суть игры (кликер-стратегия):</strong></p>
            <p>1. Кликайте на вращающийся Квантовый Нексус для получения <strong>нано-энергии (HЭ)</strong>.</p>
            <p>2. Покупайте автоматические постройки в разделе «Производство».</p>
            <p>3. Накопив 10,000 HЭ, выберите <strong>Фракцию</strong> (Сингулярность, Корпораты или Кочевники) — это откроет уникальные улучшения и супер-активные протоколы.</p>
            <p>4. Проводите «Трансцендентность» (сброс) для получения <strong>Космических Ядер</strong>, дающих постоянные проценты к доходу!</p>
          </div>
        )}
      </div>
    </div>
  );
}
