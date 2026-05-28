import React from "react";
import { motion } from "motion/react";

interface SceneRendererProps {
  levelId: number;
  isModified: boolean;
  foundIds: string[];
  onViewClick: (x: number, y: number) => void;
  showHintId?: string | null;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  levelId,
  isModified,
  foundIds,
  onViewClick,
  showHintId,
}) => {
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    onViewClick(clickX, clickY);
  };

  // Helper to check if a difference is found
  const isFound = (id: string) => foundIds.includes(id);

  // Render Scene 1: Cyberpunk Neon City
  const renderCyberpunk = () => {
    return (
      <svg
        viewBox="0 0 500 400"
        className="w-full h-full select-none cursor-crosshair touch-none"
        onClick={handleSvgClick}
        id={`cyberpunk-svg-${isModified ? "mod" : "orig"}`}
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0813" />
            <stop offset="60%" stopColor="#120c24" />
            <stop offset="100%" stopColor="#25123e" />
          </linearGradient>
          <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff007f" />
            <stop offset="100%" stopColor="#7f00ff" />
          </linearGradient>
          <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1b152d" />
            <stop offset="100%" stopColor="#08060f" />
          </linearGradient>
          <linearGradient id="vendingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2e3a59" />
            <stop offset="100%" stopColor="#161b26" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="500" height="400" fill="url(#skyGrad)" />

        {/* Cyber Stars / Grid Horizon */}
        <g opacity="0.4">
          <circle cx="80" cy="50" r="1" fill="#fff" />
          <circle cx="210" cy="70" r="1" fill="#fff" opacity="0.8" />
          <circle cx="340" cy="40" r="1.5" fill="#00ffff" />
          <circle cx="430" cy="80" r="1" fill="#fff" />
          <line x1="0" y1="320" x2="500" y2="320" stroke="#ff00aa" strokeWidth="0.5" />
          <line x1="0" y1="340" x2="500" y2="340" stroke="#ff00aa" strokeWidth="1" />
          <line x1="0" y1="370" x2="500" y2="370" stroke="#00ffff" strokeWidth="1.5" />
        </g>

        {/* Distant Skyscrapers */}
        <rect x="20" y="80" width="70" height="240" fill="url(#buildingGrad)" opacity="0.75" />
        <rect x="130" y="110" width="80" height="210" fill="#0e0a1b" opacity="0.9" />
        <rect x="370" y="90" width="110" height="230" fill="url(#buildingGrad)" />

        {/* Window Glowing Yellow/Teal Lights in distant buildings */}
        <g opacity="0.6">
          <rect x="35" y="100" width="10" height="15" fill="#ffe600" />
          <rect x="55" y="100" width="10" height="15" fill="#ffe600" opacity="0.3" />
          <rect x="35" y="140" width="10" height="15" fill="#fafafa" />
          <rect x="55" y="140" width="10" height="15" fill="#00ffff" />
          <rect x="35" y="180" width="10" height="15" fill="#ffe600" />
          
          <rect x="150" y="130" width="12" height="8" fill="#ff00ea" />
          <rect x="175" y="130" width="12" height="8" fill="#ff00ea" />
          <rect x="150" y="160" width="12" height="8" fill="#00ffff" />
          <rect x="175" y="180" width="12" height="8" fill="#ffe600" />

          <rect x="390" y="110" width="15" height="10" fill="#00ffff" />
          <rect x="420" y="110" width="15" height="10" fill="#ffe600" />
          <rect x="450" y="110" width="15" height="10" fill="#ff00fa" />
          <rect x="390" y="140" width="15" height="10" fill="#ffe600" opacity="0.2" />
          <rect x="420" y="140" width="15" height="10" fill="#00ffff" />
          <rect x="450" y="140" width="15" height="10" fill="#00ffff" />
          <rect x="390" y="170" width="15" height="10" fill="#ff0055" />
          <rect x="420" y="170" width="15" height="10" fill="#fafafa" />
          <rect x="450" y="170" width="15" height="10" fill="#ffe600" />
        </g>

        {/* Foreground Cyberpunk Alleyway Walls */}
        <path d="M 0,400 L 0,160 L 100,240 L 100,400 Z" fill="#13101E" stroke="#ff00aa" strokeWidth="1" />
        <path d="M 500,400 L 500,180 L 350,230 L 350,400 Z" fill="#0f0c18" stroke="#00ffff" strokeWidth="1" />
        {/* Street Road Ground */}
        <polygon points="100,400 350,400 350,230 100,240" fill="#0a0711" />

        {/* DIFFERENCE 1: Club neon sign "NEON" vs "NOON" at (18%, 15%) */}
        <g transform="translate(45, 30)">
          {/* Sign background board */}
          <rect x="0" y="0" width="100" height="50" rx="6" fill="#151226" stroke="#00ffff" strokeWidth="2" filter="drop-shadow(0px 0px 4px #00ffff)" />
          {/* Neon Lettering */}
          <text
            x="50"
            y="33"
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="bold"
            fontSize="24"
            fill={isModified ? "#ff007f" : "#00ffff"}
            filter="drop-shadow(0px 0px 6px currentColor)"
          >
            {isModified ? "NOON" : "NEON"}
          </text>
          {/* Accent decoration */}
          <line x1="10" y1="40" x2="90" y2="40" stroke={isModified ? "#ff007f" : "#00ffff"} strokeWidth="2" opacity="0.7" />
        </g>

        {/* DIFFERENCE 2: Flying Hover Car color/state at (75%, 22%) */}
        <g transform="translate(330, 65)">
          {/* Glider car fuselage */}
          <path
            d="M 10,25 Q 25,5 50,12 Q 75,5 90,25 Q 50,35 10,25 Z"
            fill="#2c2a38"
            stroke={isModified ? "#ff0044" : "#00f0ff"}
            strokeWidth="2.5"
          />
          {/* Wing thrusters glowing */}
          <ellipse cx="20" cy="23" rx="8" ry="3" fill={isModified ? "#ffbc00" : "#ff00fa"} />
          <ellipse cx="80" cy="23" rx="8" ry="3" fill={isModified ? "#ffbc00" : "#ff00fa"} />
          {/* Cabin dome */}
          <path d="M 35,15 Q 50,4 65,15 Z" fill={isModified ? "rgba(255,0,0,0.6)" : "rgba(0,255,255,0.6)"} />
          {/* Trail light particle */}
          <path d="M 90,22 L 115,22" stroke={isModified ? "#ff0000" : "#00ffff"} strokeWidth="3" opacity="0.8" />
        </g>

        {/* DIFFERENCE 3: Android Cat on balcony rail at (34%, 64%) */}
        {(!isModified || isFound("cyber_cat")) && (
          <g transform="translate(150, 222)" opacity={isModified ? 0.25 : 1}>
            {/* Balcony slab on left building */}
            <rect x="0" y="25" width="40" height="8" fill="#302b48" />
            <line x1="0" y1="25" x2="40" y2="25" stroke="#ff00aa" strokeWidth="2" />
            {/* Geometric Cat */}
            {/* Body */}
            <rect x="12" y="10" width="16" height="12" rx="3" fill="#ff7f00" />
            {/* Head */}
            <polygon points="20,0 28,12 14,12" fill="#d96600" />
            {/* Ears */}
            <polygon points="15,2 18,7 13,8" fill="#a64d00" />
            <polygon points="27,2 24,7 28,8" fill="#a64d00" />
            {/* Futuristic glowing cyber-eye */}
            <circle cx="18" cy="8" r="1.5" fill="#00ffff" />
            <circle cx="24" cy="8" r="1.5" fill="#00ffff" />
            {/* Tail */}
            <path d="M 12,18 Q 4,14 6,8" stroke="#ff7f00" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* DIFFERENCE 4: Corp Logo on Holographic Billboard at (85%, 52%) */}
        <g transform="translate(400, 185)">
          {/* Hologram projecting beam lines */}
          <polygon points="25,45 5,0 45,0" fill="rgba(255, 0, 180, 0.1)" />
          {/* Holographic glowing emblem */}
          {isModified ? (
            // Circle Logo
            <circle cx="25" cy="20" r="15" fill="none" stroke="#ff00ea" strokeWidth="3" filter="drop-shadow(0 0 5px #ff00ea)" />
          ) : (
            // Triangle Logo
            <polygon points="25,5 10,35 40,35" fill="none" stroke="#00ffff" strokeWidth="3" filter="drop-shadow(0 0 5px #00ffff)" />
          )}
          {/* Cross lines of bad signal holograms */}
          <line x1="5" y1="15" x2="45" y2="15" stroke="#fff" strokeWidth="1" opacity="0.5" strokeDasharray="5,3" />
        </g>

        {/* DIFFERENCE 5: Soda Vending Machine Drink Dispenser Can at (52%, 83%) */}
        <g transform="translate(240, 275)">
          {/* Vending Machine Cabinet */}
          <rect x="0" y="0" width="40" height="75" rx="4" fill="url(#vendingGrad)" stroke="#ff00ff" strokeWidth="1.5" />
          {/* Glow screen header */}
          <rect x="5" y="8" width="30" height="12" fill="#12121c" />
          <text x="20" y="17" fill="#00ffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">S0DA</text>
          {/* Button indicators */}
          <circle cx="10" cy="30" r="2" fill="#55ff55" />
          <circle cx="18" cy="30" r="2" fill="#ff5555" />
          <circle cx="26" cy="30" r="2" fill="#ffe600" />
          {/* Dispenser tray cutout */}
          <rect x="10" y="50" width="20" height="15" fill="#06060c" rx="2" />
          {/* Soda Can inside tray */}
          <rect
            x="17"
            y="53"
            width="6"
            height="11"
            rx="1"
            fill={isModified ? "#aa00ff" : "#ffd700"}
          />
          {/* Can lock glow */}
          <line x1="17" y1="55" x2="23" y2="55" stroke="#fff" strokeWidth="1" opacity="0.8" />
        </g>

        {/* DIFFERENCE 6: Rooftop Transmission Antenna at (48%, 11%) */}
        <g transform="translate(225, 15)">
          {/* Tower legs */}
          <line x1="15" y1="45" x2="15" y2="10" stroke="#7e8a9f" strokeWidth="3.5" />
          <line x1="5" y1="45" x2="15" y2="10" stroke="#5a687d" strokeWidth="2" />
          <line x1="25" y1="45" x2="15" y2="10" stroke="#5a687d" strokeWidth="2" />
          {/* Cross braces */}
          <line x1="10" y1="30" x2="20" y2="30" stroke="#7e8a9f" strokeWidth="1.5" />
          <line x1="12" y1="20" x2="18" y2="20" stroke="#7e8a9f" strokeWidth="1.5" />

          {/* Satellite Dish - MISSING if Modified */}
          {(!isModified || isFound("rooftop_antenna")) && (
            <g transform="translate(15, 6)" opacity={isModified ? 0.22 : 1}>
              {/* Crescent dish */}
              <path d="M -12,-5 Q 0,-15 12,-5 Q 2,-2 0,0 Q -2,-2 -12,-5" fill="#4d5a71" stroke="#333" strokeWidth="1" />
              {/* Central receiver pin */}
              <line x1="0" y1="-8" x2="0" y2="-18" stroke="#ff0055" strokeWidth="2" />
              <circle cx="0" cy="-18" r="2.5" fill="#ffe600" />
            </g>
          )}
        </g>

        {/* Cyber Trash bins, decorative crates, and pipes */}
        <g opacity="0.8" transform="translate(360, 310)">
          <rect x="0" y="20" width="26" height="35" rx="3" fill="#3a404a" stroke="#222" />
          <line x1="5" y1="20" x2="5" y2="55" stroke="#222" strokeWidth="1" />
          <line x1="13" y1="20" x2="13" y2="55" stroke="#222" strokeWidth="1" />
          <line x1="21" y1="20" x2="21" y2="55" stroke="#222" strokeWidth="1" />
          <rect x="5" y="5" width="40" height="25" fill="#2d1d4c" rx="1" stroke="#a62cff" />
        </g>
      </svg>
    );
  };

  // Render Scene 2: Fantasy Temple Altar
  const renderFantasy = () => {
    return (
      <svg
        viewBox="0 0 500 400"
        className="w-full h-full select-none cursor-crosshair touch-none"
        onClick={handleSvgClick}
        id={`fantasy-svg-${isModified ? "mod" : "orig"}`}
      >
        <defs>
          <linearGradient id="fantasySky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1135" />
            <stop offset="60%" stopColor="#2c1a4e" />
            <stop offset="100%" stopColor="#0d071b" />
          </linearGradient>
          <linearGradient id="columnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#41414e" />
            <stop offset="50%" stopColor="#69697a" />
            <stop offset="100%" stopColor="#2c2c35" />
          </linearGradient>
          <radialGradient id="portalPurple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff00ff" />
            <stop offset="40%" stopColor="#7f00ff" />
            <stop offset="100%" stopColor="#1e003a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="portalGreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#55ff33" />
            <stop offset="50%" stopColor="#00aa55" />
            <stop offset="100%" stopColor="#032107" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Temple chamber wall background */}
        <rect width="500" height="400" fill="url(#fantasySky)" />

        {/* Ancient Stone Wall Blocks */}
        <g opacity="0.15" stroke="#fff" strokeWidth="0.5">
          <rect x="10" y="20" width="120" height="40" fill="none" />
          <rect x="130" y="20" width="100" height="40" fill="none" />
          <rect x="230" y="20" width="150" height="40" fill="none" />
          <rect x="380" y="20" width="110" height="40" fill="none" />

          <rect x="30" y="60" width="150" height="50" fill="none" />
          <rect x="180" y="60" width="140" height="50" fill="none" />
          <rect x="320" y="60" width="150" height="50" fill="none" />

          <rect x="10" y="110" width="100" height="60" fill="none" />
          <rect x="400" y="110" width="90" height="60" fill="none" />
        </g>

        {/* LEFT COLUMN */}
        <rect x="30" y="40" width="45" height="310" fill="url(#columnGrad)" rx="2" />
        <rect x="20" y="30" width="65" height="20" fill="#2d2d3a" rx="1" />
        <rect x="25" y="340" width="55" height="20" fill="#2d2d3a" rx="1" />

        {/* RIGHT COLUMN */}
        <rect x="425" y="40" width="45" height="310" fill="url(#columnGrad)" rx="2" id="right-column-body" />
        <rect x="415" y="30" width="65" height="20" fill="#2d2d3a" rx="1" />
        <rect x="420" y="340" width="55" height="20" fill="#2d2d3a" rx="1" />

        {/* DIFFERENCE 3: Column Crack at (82%, 45%) on the right building/column */}
        {(isModified || isFound("column_crack")) && (
          <g opacity={isModified ? 1 : 0.05} transform="translate(425, 120)">
            {/* Crack path line */}
            <path
              d="M 15,0 L 25,25 L 12,45 L 30,70 L 10,95 L 22,120"
              stroke="#13131a"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Light leaking glow */}
            <path
              d="M 15,0 L 25,25 L 12,45 L 30,70 L 10,95 L 22,120"
              stroke="#00ffff"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        )}

        {/* Ancient Runes Inscriptions on columns */}
        <g fill="#ffe600" opacity="0.35" fontSize="11" fontFamily="sans-serif">
          <text x="52" y="100" textAnchor="middle">ᛒ</text>
          <text x="52" y="140" textAnchor="middle">ᚠ</text>
          <text x="52" y="180" textAnchor="middle">ᛉ</text>
          <text x="52" y="220" textAnchor="middle">ᚻ</text>

          <text x="447" y="100" textAnchor="middle">ᚨ</text>
          <text x="447" y="140" textAnchor="middle">ᛞ</text>
          <text x="447" y="180" textAnchor="middle">ᚴ</text>
          <text x="447" y="220" textAnchor="middle">ᚦ</text>
        </g>

        {/* DIFFERENCE 2: Floating Crystal on left at (22%, 24%) */}
        <g transform={`translate(95, ${isModified ? "62" : "96"})`}>
          {/* Glowing pulse ring */}
          <ellipse cx="15" cy="15" rx="20" ry="25" fill="none" stroke="#7f00ff" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.6" />
          {/* Central Crystal shape */}
          <polygon
            points="15,0 27,15 15,30 3,15"
            fill={isModified ? "#ff0099" : "#a833ff"}
            stroke="#fff"
            strokeWidth="1.5"
            // Let's invert if modified - tilt style
            transform={isModified ? "rotate(35, 15, 15)" : ""}
          />
          {/* Shiny Core */}
          <polygon points="15,4 20,15 15,26 10,15" fill="rgba(255,255,255,0.7)" />
        </g>

        {/* Pedestal & Vault Base */}
        <ellipse cx="250" cy="300" rx="140" ry="50" fill="#1b1c24" stroke="#ff00ea" strokeWidth="1" />
        <ellipse cx="250" cy="290" rx="120" ry="40" fill="#2d2f3d" stroke="#00ffff" strokeWidth="1.5" />
        <rect x="210" y="290" width="80" height="60" fill="#3f4254" stroke="#5a5e77" strokeWidth="2" />

        {/* DIFFERENCE 1: Inner magic altar flame/portal color at (50%, 35%) */}
        <g transform="translate(250, 140)">
          {/* Big Glow Orb */}
          <circle
            cx="0"
            cy="0"
            r="85"
            fill={isModified ? "url(#portalGreen)" : "url(#portalPurple)"}
          />
          {/* Core Star / Spark */}
          <path
            d="M 0,-40 Q 0,0 40,0 Q 0,0 0,40 Q 0,0 -40,0 Q 0,0 0,-40"
            fill="#ffffff"
            filter="drop-shadow(0 0 8px currentColor)"
          />
          <circle cx="0" cy="0" r="10" fill="#fff" />
        </g>

        {/* DIFFERENCE 4: Spellbook state at (32%, 78%) */}
        <g transform="translate(130, 275)">
          {/* Lectern wooden desk stand */}
          <polygon points="15,50 35,50 30,85 20,85" fill="#5c3818" />
          <polygon points="0,20 50,15 45,35 5,40" fill="#3e240c" />
          
          {/* The Grimoire book */}
          {isModified ? (
            // Closed spell book with golden lock
            <g transform="rotate(-6, 25, 23)">
              <rect x="6" y="8" width="38" height="26" rx="2" fill="#751c1c" stroke="#ffe600" strokeWidth="2" />
              <rect x="22" y="8" width="6" height="26" fill="#ffe600" />
              {/* Lock chain */}
              <circle cx="25" cy="21" r="5" fill="#ffe600" />
              <circle cx="25" cy="21" r="2" fill="#111" />
            </g>
          ) : (
            // Opened book with magic spell signs
            <g transform="rotate(-4, 25, 24)">
              {/* Leather cover */}
              <rect x="4" y="10" width="42" height="24" rx="2" fill="#751c1c" />
              {/* Paper leaves */}
              <rect x="6" y="11" width="18" height="21" fill="#f4ebd0" />
              <rect x="24" y="11" width="18" height="21" fill="#f4ebd0" />
              {/* Binding line */}
              <line x1="24" y1="11" x2="24" y2="32" stroke="#444" strokeWidth="1" />
              {/* Scribbled spells runes */}
              <path d="M 8,15 L 20,15 M 8,19 L 16,19 M 8,23 L 18,23" stroke="#222" strokeWidth="1" />
              <path d="M 28,15 L 40,15 M 28,19 L 36,19 M 28,23 L 38,23" stroke="#222" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* DIFFERENCE 5: Healing Potion bottle at (68%, 74%) */}
        {(!isModified || isFound("potion_bottle")) && (
          <g transform="translate(320, 268)" opacity={isModified ? 0.2 : 1}>
            {/* Wooden shelf / small table */}
            <polygon points="5,45 45,43 40,65 10,65" fill="#3e240c" />
            
            {/* Potion Flask */}
            {/* Glowing liquid */}
            <ellipse cx="25" cy="31" rx="11" ry="11" fill="#00ffcc" />
            {/* Glass envelope */}
            <ellipse cx="25" cy="31" rx="13" ry="13" fill="none" stroke="#fff" strokeWidth="1.5" />
            {/* Neck of flask */}
            <rect x="21" y="10" width="8" height="11" fill="none" stroke="#fff" strokeWidth="1.5" />
            {/* Glowing solution lever */}
            <rect x="22" y="25" width="6" height="15" fill="#00ffcc" opacity="0.6" />
            {/* Wooden cork stopper */}
            <rect x="22" y="7" width="6" height="5" fill="#845729" />
          </g>
        )}

        {/* DIFFERENCE 6: Shield Crest Emblem at (7%, 52%) leaning at wall */}
        <g transform="translate(20, 180)">
          {/* Iron shield shield shape */}
          <path d="M 5,0 Q 20,5 35,0 Q 35,25 20,40 Q 5,25 5,0 Z" fill="#7d808d" stroke="#24252a" strokeWidth="2.5" />
          <path d="M 8,3 Q 20,7 32,3 Q 32,23 20,36 Q 8,23 8,3 Z" fill="#a4a8b7" />
          {/* Emblem INSIGNIA - Crescent (modified) vs Sun (original) */}
          {isModified ? (
            // Moon/Crescent
            <path d="M 18,12 A 6,6 0 1,0 26,18 A 8,8 0 1,1 18,12 Z" fill="#ffc800" stroke="#cc5200" strokeWidth="0.5" />
          ) : (
            // Gold Sun Crest
            <g>
              <circle cx="20" cy="18" r="5" fill="#ffd700" />
              {/* rays */}
              <line x1="20" y1="10" x2="20" y2="26" stroke="#ffd700" strokeWidth="1.5" />
              <line x1="12" y1="18" x2="28" y2="18" stroke="#ffd700" strokeWidth="1.5" />
              <line x1="14" y1="12" x2="26" y2="24" stroke="#ffd700" strokeWidth="1" />
              <line x1="26" y1="12" x2="14" y2="24" stroke="#ffd700" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* Floor, candles and decorative objects */}
        <g fill="#25242d" stroke="#121217">
          <polygon points="0,400 500,400 420,350 80,350" />
        </g>
        {/* Glowing floor candle candles */}
        <g transform="translate(10, 350)">
          <rect x="30" y="5" width="8" height="25" fill="#fdfbef" rx="1" />
          <ellipse cx="34" cy="5" rx="3.5" ry="5" fill="#ffa700" />
          <circle cx="34" cy="5" r="1.5" fill="#fff" />
          
          <rect x="42" y="15" width="6" height="15" fill="#fdfbef" rx="1" />
          <ellipse cx="45" cy="15" rx="2.5" ry="4.5" fill="#ffa700" />
        </g>
      </svg>
    );
  };

  // Render Scene 3: Cozy Farmwood Kitchen
  const renderCozy = () => {
    return (
      <svg
        viewBox="0 0 500 400"
        className="w-full h-full select-none cursor-crosshair touch-none"
        onClick={handleSvgClick}
        id={`cozy-svg-${isModified ? "mod" : "orig"}`}
      >
        <defs>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdf7e7" />
            <stop offset="100%" stopColor="#eadecb" />
          </linearGradient>
          <linearGradient id="fridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bcd4de" />
            <stop offset="100%" stopColor="#9cb6c5" />
          </linearGradient>
        </defs>

        {/* Walls */}
        <rect width="500" height="400" fill="url(#wallGrad)" />

        {/* Flooring wood lines */}
        <polygon points="0,400 500,400 500,320 0,320" fill="#cc9d74" stroke="#aa7951" strokeWidth="1" />
        <line x1="100" y1="320" x2="50" y2="400" stroke="#aa7951" strokeWidth="1" />
        <line x1="250" y1="320" x2="220" y2="400" stroke="#aa7951" strokeWidth="1" />
        <line x1="400" y1="320" x2="380" y2="400" stroke="#aa7951" strokeWidth="1" />

        {/* Room Window Frame at (28%, 20%) */}
        <g transform="translate(90, 30)">
          {/* Sky behind window */}
          <rect x="0" y="0" width="100" height="100" fill="#a4d7f0" stroke="#77a1bc" strokeWidth="1" />
          
          {/* WEATHER DIFFERENCE 5: Sun vs Rain Cloud */}
          {isModified ? (
            // Rain Cloud
            <path d="M 30,50 Q 40,40 50,45 Q 60,35 75,45 Q 85,50 80,60 L 25,60 Z" fill="#8ca0ba" />
          ) : (
            // Warm Sun
            <circle cx="75" cy="30" r="16" fill="#ffde38" filter="drop-shadow(0 0 4px #ffde38)" />
          )}

          {/* Window pane outline */}
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="#764a2e" strokeWidth="6" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#764a2e" strokeWidth="4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#764a2e" strokeWidth="4" />
          {/* Cozy White Curtains */}
          <path d="M 0,0 C 20,20 25,50 10,100 L 0,100 Z" fill="#fafafa" opacity="0.9" />
          <path d="M 100,0 C 80,20 75,50 90,100 L 100,100 Z" fill="#fafafa" opacity="0.9" />
        </g>

        {/* DIFFERENCE 2: Potted window plant at (12%, 42%) */}
        <g transform="translate(45, 140)">
          {/* Ceramic pot */}
          <polygon points="5,35 25,35 21,50 9,50" fill="#da7055" stroke="#a04a34" />
          {/* Plant leaves */}
          <path d="M 15,35 Q 2,20 8,10 Q 14,21 15,35" fill="#4fa75d" />
          <path d="M 15,35 Q 26,20 20,8 Q 14,21 15,35" fill="#3f9250" />
          <path d="M 15,35 Q 15,10 11,2 M 15,35 Q 15,10 19,2" stroke="#337f43" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* EXTRA leaf if modified */}
          {(isModified || isFound("plant_leaf")) && (
            <path
              d="M 15,35 Q 35,32 32,20 Q 22,25 15,35"
              fill="#69bc76"
              opacity={isModified ? 1 : 0.1}
            />
          )}
        </g>

        {/* DIFFERENCE 1: Floating Wall Clock hands at (50%, 19%) */}
        <g transform="translate(225, 45)">
          {/* Round dial frame */}
          <circle cx="25" cy="25" r="23" fill="#faf6e9" stroke="#906041" strokeWidth="3.5" />
          <circle cx="25" cy="25" r="1.5" fill="#333" />
          {/* Roman mark ticks */}
          <line x1="25" y1="5" x2="25" y2="8" stroke="#333" strokeWidth="1.5" />
          <line x1="25" y1="45" x2="25" y2="42" stroke="#333" strokeWidth="1.5" />
          <line x1="5" y1="25" x2="8" y2="25" stroke="#333" strokeWidth="1.5" />
          <line x1="45" y1="25" x2="42" y2="25" stroke="#333" strokeWidth="1.5" />
          
          {/* Hands: Original 10:15 vs Modified 10:45 */}
          {isModified ? (
            // 10:45 Hands
            <g>
              <line x1="25" y1="25" x2="11" y2="25" stroke="#333" strokeWidth="2.2" strokeLinecap="round" /> {/* minute hand for 45 */}
              <line x1="25" y1="25" x2="16" y2="18" stroke="#333" strokeWidth="1.5" strokeLinecap="round" /> {/* hour hand for 10 */}
            </g>
          ) : (
            // 10:15 Hands
            <g>
              <line x1="25" y1="25" x2="39" y2="25" stroke="#333" strokeWidth="2.2" strokeLinecap="round" /> {/* minute hand for 15 */}
              <line x1="25" y1="25" x2="16" y2="18" stroke="#333" strokeWidth="1.5" strokeLinecap="round" /> {/* hour hand for 10 */}
            </g>
          )}
        </g>

        {/* Shelf on the right with mugs */}
        <rect x="300" y="115" width="105" height="8" rx="2" fill="#805634" />

        {/* DIFFERENCE 4: Missing Mug on the upper right shelf at (68%, 32%) */}
        {(!isModified || isFound("shelf_mug")) && (
          <g transform="translate(325, 93)" opacity={isModified ? 0.2 : 1}>
            {/* Orange ceramic mug */}
            <rect x="5" y="4" width="20" height="18" rx="1.5" fill="#e8731d" />
            {/* Mug Handle */}
            <path d="M 23,8 C 28,10 28,16 23,18" stroke="#e8731d" strokeWidth="2.5" fill="none" />
            {/* Decorative strip */}
            <rect x="5" y="10" width="20" height="3" fill="#ffd53e" />
          </g>
        )}
        {/* Unchanging secondary mug */}
        <g transform="translate(365, 93)">
          <rect x="5" y="4" width="20" height="18" rx="1.5" fill="#3290b5" />
          <path d="M 5,8 C 0,10 0,16 5,18" stroke="#3290b5" strokeWidth="2.5" fill="none" />
        </g>

        {/* Double-door Fridge on the right */}
        <g transform="translate(420, 160)">
          <rect x="0" y="0" width="65" height="160" rx="3" fill="url(#fridgeGrad)" stroke="#678393" strokeWidth="2" />
          {/* Door gap */}
          <line x1="0" y1="65" x2="65" y2="65" stroke="#678393" strokeWidth="3" />
          {/* Chrome handles */}
          <rect x="5" y="55" width="20" height="6" fill="#ccd8e0" rx="1" />
          <rect x="5" y="70" width="20" height="6" fill="#ccd8e0" rx="1" />

          {/* Fridge magnets */}
          <rect x="35" y="15" width="12" height="12" rx="1" fill="#e82c1d" /> {/* post-it note */}
          
          {/* DIFFERENCE 3: Magnet shape (Star vs Heart) at (88%, 62%) -> 440px on X, 248px on Y is relative coordinates (440 = 420+20, 248 = 160+88) */}
          <g transform="translate(18, 85)">
            {isModified ? (
              // Heart shape
              <path d="M 10,5 C 10,2 6,2 6,5 C 6,10 10,13 10,14 C 10,13 14,10 14,5 C 14,2 10,2 10,5" fill="#ff22aa" stroke="#aa0c5e" strokeWidth="0.5" />
            ) : (
              // Star shape
              <polygon points="10,2 12,7 18,7 13,10 15,16 10,12 5,16 7,10 2,7 8,7" fill="#ffe600" stroke="#cc5200" strokeWidth="0.5" />
            )}
          </g>
        </g>

        {/* Central Kitchen Table Countertop */}
        <g transform="translate(100, 270)">
          {/* Table Base */}
          <rect x="0" y="30" width="220" height="65" fill="#99704e" stroke="#66462e" />
          {/* Table leg lines */}
          <line x1="20" y1="30" x2="20" y2="95" stroke="#66462e" strokeWidth="3" />
          <line x1="200" y1="30" x2="200" y2="95" stroke="#66462e" strokeWidth="3" />
          
          {/* Table wood top counter */}
          <rect x="-15" y="15" width="250" height="15" rx="3" fill="#ebd2b4" stroke="#99704e" strokeWidth="2" />

          {/* Birthday Cake plate */}
          <ellipse cx="110" cy="18" rx="42" ry="8" fill="#e1e1e9" stroke="#999" />
          
          {/* The Cake! */}
          <rect x="75" y="-12" width="70" height="25" rx="2" fill="#eed9cc" />
          <rect x="75" y="-1" width="70" height="3" fill="#dc2f2f" /> {/* strawberry layer */}
          <rect x="75" y="-12" width="70" height="5" fill="#fafafa" rx="1" /> {/* cream topping */}

          {/* Candle on cake */}
          <rect x="108" y="-22" width="4" height="10" fill="#38c1ff" />
          <circle cx="110" cy="-24" r="2.5" fill="#ffe600" />

          {/* DIFFERENCE 6: Cherry on Cake Top at (46%, 77%) */}
          {(!isModified || isFound("table_cake")) && (
            <g transform="translate(122, -19)" opacity={isModified ? 0.15 : 1}>
              {/* Stem */}
              <path d="M 0,0 C 5,-8 10,-8 15,-4" stroke="#3d6c3e" strokeWidth="1.5" fill="none" />
              {/* Sweet Red Cherry */}
              <circle cx="0" cy="0" r="4.5" fill="#d00c0c" id="cherry-shape" />
            </g>
          )}
        </g>
      </svg>
    );
  };

  // Render Scene 4: Spaceship Stellar Bridge
  const renderSpace = () => {
    return (
      <svg
        viewBox="0 0 500 400"
        className="w-full h-full select-none cursor-crosshair touch-none"
        onClick={handleSvgClick}
        id={`space-svg-${isModified ? "mod" : "orig"}`}
      >
        <defs>
          <linearGradient id="deepSpace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#02020a" />
            <stop offset="100%" stopColor="#0c0e27" />
          </linearGradient>
          <linearGradient id="planetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ab32ff" />
            <stop offset="60%" stopColor="#a3029f" />
            <stop offset="100%" stopColor="#250044" />
          </linearGradient>
          <linearGradient id="consoleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#353f4d" />
            <stop offset="100%" stopColor="#181c22" />
          </linearGradient>
        </defs>

        {/* Space background */}
        <rect width="500" height="400" fill="url(#deepSpace)" />

        {/* Twinkly Stars in Deep Space */}
        <g opacity="0.65">
          <circle cx="50" cy="80" r="1" fill="#fff" />
          <circle cx="160" cy="50" r="1" fill="#fff" />
          <circle cx="340" cy="70" r="1.5" fill="#fff" />
          <circle cx="430" cy="40" r="1" fill="#ffd53e" />
          <polygon points="120,30 122,34 126,35 122,36 120,40 118,36 114,35 118,34" fill="#00ffff" />
          <polygon points="390,90 392,93 395,94 392,95 390,98 388,95 385,94 388,93" fill="#ff00ea" />
        </g>

        {/* Outer space purple nebula decorative haze */}
        <ellipse cx="250" cy="110" rx="140" ry="60" fill="#a4078c" opacity="0.15" filter="blur(15px)" />

        {/* DIFFERENCE 2: Planet Rings at (50%, 20%) -> 250px on X, 80px on Y */}
        <g transform="translate(250, 80)">
          {/* Ring backdrop logic */}
          {(!isModified || isFound("planet_ring")) && (
            <ellipse
              cx="0"
              cy="0"
              rx="85"
              ry="18"
              fill="none"
              stroke="#00ffff"
              strokeWidth="5"
              opacity={isModified ? 0.15 : 0.6}
              transform="rotate(-15)"
            />
          )}

          {/* Planet Body */}
          <circle cx="0" cy="0" r="45" fill="url(#planetGrad)" />
          {/* Planet atmosphere shader */}
          <circle cx="0" cy="0" r="45" fill="none" stroke="#ff00de" strokeWidth="2.5" opacity="0.5" />

          {/* Ring foreground logic */}
          {(!isModified || isFound("planet_ring")) && (
            <path
              d="M -82,21 C -60,25 60,3 82,-21"
              fill="none"
              stroke="#eb02cd"
              strokeWidth="4"
              opacity={isModified ? 0.15 : 0.9}
              transform="rotate(-15)"
            />
          )}
        </g>

        {/* Large Ship Circular Window Structure */}
        <path
          d="M 0,220 L 500,220"
          stroke="#414856"
          strokeWidth="10"
          fill="none"
        />
        {/* Arch curved glass frames */}
        <path
          d="M 0,0 L 0,220 A 250,220 0 0,1 500,220 L 500,0 Z"
          fill="none"
          stroke="#272c35"
          strokeWidth="16"
        />

        {/* Main Steel Cabin floor */}
        <rect x="0" y="224" width="500" height="180" fill="#1b2028" />

        {/* DIFFERENCE 5: Left Terminal Monitor Info at (32%, 38%) -> x 160, y 152 */}
        <g transform="translate(130, 125)">
          <rect x="0" y="0" width="55" height="42" rx="3" fill="#15171e" stroke="#00d5ff" strokeWidth="2.5" />
          <line x1="27" y1="42" x2="27" y2="55" stroke="#353f4d" strokeWidth="6" />
          
          {/* Content state */}
          {isModified ? (
            // Danger critical Alert code
            <g>
              <rect x="4" y="4" width="47" height="34" fill="#a40000" />
              <text x="27" y="22" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ERR</text>
              <line x1="10" y1="28" x2="45" y2="28" stroke="#ffde38" strokeWidth="2" strokeDasharray="3,2" />
            </g>
          ) : (
            // Good diagnostic smiley green standard
            <g>
              <rect x="4" y="4" width="47" height="34" fill="#004a11" />
              <text x="27" y="22" fill="#00ff66" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">OK</text>
              {/* Little grid vector screen */}
              <circle cx="15" cy="28" r="1.5" fill="#00ff66" />
              <circle cx="28" cy="28" r="1.5" fill="#00ff66" />
              <circle cx="40" cy="28" r="1.5" fill="#00ff66" />
            </g>
          )}
        </g>

        {/* DIFFERENCE 1: Circle Radar display left at (18%, 48%) -> x: 90, y: 192 */}
        <g transform="translate(60, 160)">
          <circle cx="30" cy="30" r="28" fill="#051c08" stroke="#00ff66" strokeWidth="3.5" />
          {/* Grid lines */}
          <line x1="30" y1="2" x2="30" y2="58" stroke="#003311" strokeWidth="1" />
          <line x1="2" y1="30" x2="58" y2="30" stroke="#003311" strokeWidth="1" />
          <circle cx="30" cy="30" r="18" fill="none" stroke="#003311" strokeWidth="1" />
          
          {/* Sweep radar arm line */}
          <line x1="30" y1="30" x2="16" y2="8" stroke="#00ff66" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Dots/Radar targets */}
          <circle cx="18" cy="20" r="2.5" fill="#ffeb3b" />
          <circle cx="42" cy="40" r="2.5" fill="#ffeb3b" />
          
          {/* EXTRA dot if modified */}
          {(isModified || isFound("radar_blips")) && (
            <circle
              cx="44"
              cy="15"
              r="2.5"
              fill="#ff0000"
              opacity={isModified ? 1 : 0.15}
            />
          )}
        </g>

        {/* Center Pilot Command Seat */}
        <g transform="translate(210, 200)">
          <rect x="15" y="45" width="50" height="95" rx="10" fill="#353f4d" stroke="#525d6f" strokeWidth="3" />
          <rect x="25" y="55" width="30" height="40" rx="3" fill="#1b2028" />
          <rect x="0" y="90" width="80" height="15" rx="4" fill="#525d6f" />
          
          {/* Metallic stand */}
          <rect x="35" y="140" width="10" height="30" fill="#2d3542" />
        </g>

        {/* DIFFERENCE 4: Astronaut Helmet Visor color at (78%, 54%) resting on secondary side box -> x: 390, y: 216 */}
        <g transform="translate(365, 192)">
          {/* Flight deck side terminal panel */}
          <rect x="0" y="45" width="55" height="110" fill="url(#consoleGrad)" stroke="#1a1f26" strokeWidth="3.5" />
          
          {/* Astronaut Helmet */}
          <circle cx="28" cy="25" r="18" fill="#ebebeb" stroke="#bbb" strokeWidth="1" />
          <rect x="18" y="38" width="20" height="6" fill="#ddd" rx="1" />
          
          {/* Visor shield - Gold (Modified) vs Blue (Original) */}
          <path
            d="M 16,22 C 16,12 40,12 40,22 L 36,30 L 20,30 Z"
            fill={isModified ? "#ffd700" : "#00bcd4"}
            stroke="#fff"
            strokeWidth="0.5"
          />
          {/* Visor reflection shine */}
          <ellipse cx="23" cy="18" rx="4" ry="2" fill="#fff" opacity="0.6" transform="rotate(-15, 23, 18)" />
        </g>

        {/* Console Buttons and Panels foreground */}
        <g transform="translate(0, 310)">
          {/* Main dashboard board */}
          <polygon points="0,90 500,90 500,20 0,20" fill="#2d3542" stroke="#1b2028" strokeWidth="3" />
          
          {/* Grid consoles controls */}
          <rect x="40" y="35" width="40" height="30" fill="#171c22" stroke="#ff00ea" />
          <circle cx="50" cy="45" r="3" fill="#00ff66" />
          <circle cx="60" cy="45" r="3" fill="#ff0000" />
          <circle cx="70" cy="45" r="3" fill="#ffde38" />
          <circle cx="50" cy="55" r="3" fill="#fff" />
          <circle cx="60" cy="55" r="3" fill="#00ffff" />

          {/* Slider levers */}
          <rect x="150" y="35" width="30" height="35" fill="#171c22" />
          <line x1="158" y1="40" x2="158" y2="65" stroke="#aaa" strokeWidth="2.5" />
          <line x1="172" y1="40" x2="172" y2="65" stroke="#aaa" strokeWidth="2.5" />
          {/* slider knobs */}
          <rect x="155" y="45" width="6" height="4" fill="#ff5555" />
          <rect x="169" y="55" width="6" height="4" fill="#00ffff" />

          {/* DIFFERENCE 3: Red Emergency self-destruct covering cap at (48%, 76%) -> x: 240, y: 304 */}
          <g transform="translate(225, 30)">
            {/* The base switch plate */}
            <rect x="0" y="0" width="35" height="45" fill="#3c4554" stroke="#00ffff" />
            {/* The Big Red Button */}
            <circle cx="17" cy="22" r="9" fill="#d32f2f" />
            <circle cx="15" cy="20" r="3" fill="#ff6b6b" />

            {/* Protective Cage glass case - present if MODIFIED */}
            {(isModified || isFound("pulpit_button")) && (
              <path
                d="M 5,35 Q 17,5 30,35 Z"
                fill="rgba(0, 213, 255, 0.4)"
                stroke="#00ffff"
                strokeWidth="1.5"
                opacity={isModified ? 1 : 0.15}
              />
            )}
          </g>
        </g>

        {/* DIFFERENCE 6: Ceiling Red warning rotary lights at (86%, 12%) -> x: 430, y: 48 */}
        <g transform="translate(415, 20)">
          {/* Metal base fixture */}
          <rect x="0" y="0" width="30" height="10" rx="2" fill="#4d5462" />
          {/* Glass dome lamp */}
          <path d="M 5,10 Q 15,30 25,10 Z" fill={isModified ? "#ff0000" : "#ffe600"} opacity="0.95" />
          {/* Rotating halo flare rays if modified */}
          {isModified && (
            <g opacity="0.8">
              <line x1="15" y1="20" x2="15" y2="35" stroke="#ff0000" strokeWidth="2.5" />
              <line x1="15" y1="20" x2="0" y2="28" stroke="#ff0000" strokeWidth="1.5" />
              <line x1="15" y1="20" x2="30" y2="28" stroke="#ff0000" strokeWidth="1.5" />
            </g>
          )}
          {/* Normal cozy white glow if original */}
          {!isModified && (
            <circle cx="15" cy="18" r="8" fill="rgba(255, 240, 100, 0.35)" filter="blur(2px)" />
          )}
        </g>
      </svg>
    );
  };

  // Render Scene 5: Treasure Cove (Pirate Island)
  const renderIsland = () => {
    return (
      <svg
        viewBox="0 0 500 400"
        className="w-full h-full select-none cursor-crosshair touch-none"
        onClick={handleSvgClick}
        id={`island-svg-${isModified ? "mod" : "orig"}`}
      >
        <defs>
          <linearGradient id="skyTropical" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2ca8d9" />
            <stop offset="50%" stopColor="#79daf2" />
            <stop offset="100%" stopColor="#ffd3b0" />
          </linearGradient>
          <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0bbcd3" />
            <stop offset="100%" stopColor="#015d8a" />
          </linearGradient>
          <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8d5f30" />
            <stop offset="100%" stopColor="#55381b" />
          </linearGradient>
        </defs>

        {/* Tropical sky gradient */}
        <rect width="500" height="420" fill="url(#skyTropical)" />

        {/* Fluffy beautiful orange sunset clouds */}
        <g opacity="0.7">
          <path d="M 40,40 Q 60,20 80,30 Q 110,15 130,40 Q 150,30 170,45 L 30,45 Z" fill="#fff" />
          <path d="M 320,60 Q 340,40 370,50 Q 395,35 415,55 L 300,55 Z" fill="#ffebd6" />
        </g>

        {/* Giant bright sun (low in the horizon sky backdrop) */}
        <circle cx="430" cy="140" r="35" fill="#fff7d6" opacity="0.9" />

        {/* Blue Sea ocean water */}
        <rect x="0" y="160" width="500" height="240" fill="url(#seaGrad)" />
        {/* Distant islands on horizon */}
        <polygon points="120,160 160,140 190,160" fill="#4fa5ad" opacity="0.6" />
        <polygon points="280,160 340,125 390,160" fill="#4fa5ad" opacity="0.4" />

        {/* White ocean wave ripple line strips */}
        <g stroke="#fff" strokeWidth="1" opacity="0.4" strokeLinecap="round">
          <line x1="50" y1="180" x2="120" y2="180" />
          <line x1="310" y1="190" x2="430" y2="190" />
          <line x1="180" y1="210" x2="270" y2="210" strokeWidth="1.5" />
          <line x1="20" y1="230" x2="90" y2="230" />
        </g>

        {/* DIFFERENCE 3: Distant Pirate Ship Sails at (85%, 35%) -> x: 425, y: 140 */}
        <g transform="translate(390, 115)">
          {/* Water Splash */}
          <ellipse cx="25" cy="30" rx="15" ry="3" fill="#fff" opacity="0.5" />
          {/* Wood Hull */}
          <path d="M 5,25 Q 25,32 45,25 L 42,21 L 8,21 Z" fill="#583110" />
          
          {/* Pirate Skull Sails - Black damaged if modified */}
          {isModified ? (
            <g>
              {/* Mast poles */}
              <line x1="18" y1="22" x2="18" y2="2" stroke="#444" strokeWidth="2" />
              <line x1="32" y1="22" x2="32" y2="4" stroke="#444" strokeWidth="1.5" />
              {/* Red torn sails */}
              <path d="M 18,2 C 10,7 10,15 18,18 Z" fill="#2d2d2d" stroke="#111" />
              <path d="M 32,4 C 26,8 26,16 32,19 Z" fill="#2d2d2d" stroke="#111" />
              <line x1="14" y1="10" x2="10" y2="12" stroke="#2d2d2d" strokeWidth="1" /> {/* tearing */}
            </g>
          ) : (
            <g>
              {/* White merchant sails */}
              <line x1="18" y1="22" x2="18" y2="2" stroke="#777" strokeWidth="2" />
              <line x1="32" y1="22" x2="32" y2="4" stroke="#777" strokeWidth="1.5" />
              {/* White sails */}
              <path d="M 18,2 C 8,7 8,16 18,19 Z" fill="#fafafa" />
              <path d="M 32,4 C 24,9 24,16 32,19 Z" fill="#fafafa" />
            </g>
          )}
        </g>

        {/* Sand coast ground beach on the left and bottom */}
        <path d="M 0,220 Q 150,230 200,280 Q 250,330 350,340 Q 420,345 500,370 L 500,400 L 0,400 Z" fill="#fbe5b8" />
        <ellipse cx="140" cy="270" rx="80" ry="25" fill="#eed198" opacity="0.7" />
        
        {/* Pirate Jolly Roger flag at (78%, 18%) -> x: 390, y: 72 */}
        <g transform="translate(370, 42)">
          {/* Wooden pole */}
          <line x1="20" y1="60" x2="20" y2="10" stroke="#744e27" strokeWidth="2.5" />
          {/* Pirate Flag skull cross emblem */}
          <rect x="20" y="10" width="35" height="22" fill="#151515" />
          {/* Emblem: Swords vs Crossbones */}
          {isModified ? (
            // Sabre Swords
            <g stroke="#fafafa" strokeWidth="1.5">
              <line x1="25" y1="15" x2="45" y2="27" />
              <line x1="45" y1="15" x2="25" y2="27" />
              <circle cx="35" cy="21" r="3.5" fill="#fafafa" stroke="none" />
            </g>
          ) : (
            // Crossbones
            <g stroke="#fafafa" strokeWidth="1.5">
              <line x1="25" y1="15" x2="45" y2="27" strokeDasharray="3,1" />
              <line x1="45" y1="15" x2="25" y2="27" strokeDasharray="3,1" />
              <circle cx="35" cy="21" r="3.5" fill="#fafafa" stroke="none" />
            </g>
          )}
        </g>

        {/* Twin Palm Trees on the left */}
        <g transform="translate(-10, 150)">
          {/* Curved Palm Tree Trunk */}
          <path d="M 50,150 Q 80,80 100,10" fill="none" stroke="url(#trunkGrad)" strokeWidth="11" strokeLinecap="round" />
          {/* Trunk Segment lines */}
          <g stroke="#3e240c" strokeWidth="2" opacity="0.4">
            <line x1="56" y1="130" x2="68" y2="125" />
            <line x1="68" y1="100" x2="79" y2="94" />
            <line x1="79" y1="70" x2="89" y2="62" />
            <line x1="88" y1="40" x2="97" y2="33" />
          </g>

          {/* Tropical palm leaves */}
          <g transform="translate(100, 10)">
            <path d="M 0,0 C -30,-15 -70,-5 -90,20 C -60,10 -30,10 0,0" fill="#2d8e40" />
            <path d="M 0,0 C 20,-30 70,-45 95,-35 C 65,-20 30,0 0,0" fill="#1d6e2e" />
            <path d="M 0,0 C 40,5 85,25 95,55 C 65,30 30,10 0,0" fill="#2d8e40" />
            <path d="M 0,0 C -20,-40 -50,-70 -85,-75 C -55,-50 -25,-20 0,0" fill="#50ab63" />
            <path d="M 0,0 C -15,40 5,85 15,105 C 10,75 5,40 0,0" fill="#1d6e2e" />
          </g>

          {/* DIFFERENCE 2: Left Palm ripe coconuts at (16%, 32%) -> x: 80, y: 128 */}
          {(!isModified || isFound("palm_cocos")) && (
            <g transform="translate(85, -2)">
              {/* Coconut clusters */}
              <circle cx="0" cy="8" r="7.5" fill="#754c24" stroke="#472d15" strokeWidth="1" />
              <circle cx="10" cy="14" r="7.5" fill="#56371a" stroke="#472d15" strokeWidth="1" />
              {isModified && (
                // Coconut lying in the sand coordinates
                <g transform="translate(-50, 230)">
                  <circle cx="0" cy="0" r="7.5" fill="#754c24" stroke="#472d15" strokeWidth="1.5" />
                </g>
              )}
            </g>
          )}
        </g>

        {/* DIFFERENCE 1: Chest Locking Lock variant at (48%, 78%) -> x: 240, y: 312 */}
        <g transform="translate(210, 275)">
          {/* Pirate Treasure Chest */}
          <rect x="0" y="15" width="60" height="38" rx="3" fill="#67411a" stroke="#2a1603" strokeWidth="2.5" />
          {/* Vault iron strips */}
          <rect x="8" y="15" width="6" height="38" fill="#bc7d35" />
          <rect x="46" y="15" width="6" height="38" fill="#bc7d35" />
          {/* Curved vault lid lid */}
          <path d="M 0,15 Q 30,-12 60,15 Z" fill="#bc7d35" stroke="#2a1603" strokeWidth="2" />
          <path d="M 6,15 Q 30,-6 54,15 Z" fill="#67411a" />

          {/* Gold lock at center */}
          {isModified ? (
            // Golden skull skull lock
            <g transform="translate(18, 12)">
              <rect x="4" y="0" width="16" height="15" rx="2" fill="#ffd700" stroke="#cc5200" strokeWidth="1" />
              {/* Skull eyes */}
              <circle cx="9" cy="5" r="2.2" fill="#111" />
              <circle cx="15" cy="5" r="2.2" fill="#111" />
              <line x1="12" y1="8" x2="12" y2="13" stroke="#111" strokeWidth="1.5" />
            </g>
          ) : (
            // Traditional heavy black iron padlock lock
            <g transform="translate(18, 12)">
              <rect x="4" y="0" width="16" height="15" rx="1.5" fill="#31353a" stroke="#222" strokeWidth="1.5" />
              <circle cx="12" cy="7" r="2" fill="#ffd700" />
              <line x1="12" y1="7" x2="12" y2="12" stroke="#ffd700" strokeWidth="1.5" />
            </g>
          )}
        </g>

        {/* DIFFERENCE 4: Red beach starfish on the sand bottom-left at (31%, 91%) -> x: 155, y: 364 */}
        <g transform="translate(142, 345)">
          {isModified ? (
            // Blue starfish
            <polygon
              points="10,0 13,8 21,8 15,13 18,20 10,15 2,20 5,13 -1,8 7,8"
              fill="#00bcd4"
              stroke="#01507d"
              strokeWidth="1"
            />
          ) : (
            // Red Starfish
            <polygon
              points="10,0 13,8 21,8 15,13 18,20 10,15 2,20 5,13 -1,8 7,8"
              fill="#ff4081"
              stroke="#8e123a"
              strokeWidth="1.5"
            />
          )}
        </g>

        {/* DIFFERENCE 5: Island Cute sand crab direction (facing left vs right) at (64%, 86%) -> x: 320, y: 344 */}
        <g transform="translate(305, 332)">
          {isModified ? (
            // Facing Left
            <g>
              {/* Shell */}
              <ellipse cx="14" cy="12" rx="9" ry="6" fill="#f44336" stroke="#b71c1c" />
              {/* Eyes */}
              <circle cx="9" cy="6" r="1.5" fill="#000" />
              <circle cx="14" cy="4" r="1.5" fill="#000" />
              {/* Claws */}
              <path d="M 6,10 Q -2,6 3,2" stroke="#f44336" strokeWidth="2.5" fill="none" />
              <path d="M 20,10 Q 24,7 23,2" stroke="#f44336" strokeWidth="1.5" fill="none" />
              {/* Legs */}
              <path d="M 12,17 L 8,23 M 16,17 L 13,23 M 18,17 L 18,23" stroke="#8d1c1c" strokeWidth="1.5" />
            </g>
          ) : (
            // Facing Right
            <g>
              {/* Shell */}
              <ellipse cx="14" cy="12" rx="9" ry="6" fill="#f44336" stroke="#b71c1c" />
              {/* Eyes */}
              <circle cx="14" cy="6" r="1.5" fill="#000" />
              <circle cx="19" cy="4" r="1.5" fill="#000" />
              {/* Claws */}
              <path d="M 6,10 Q 2,7 3,2" stroke="#f44336" strokeWidth="1.5" fill="none" />
              <path d="M 20,10 Q 28,6 23,2" stroke="#f44336" strokeWidth="2.5" fill="none" />
              {/* Legs */}
              <path d="M 10,17 L 6,23 M 14,17 L 11,23 M 18,17 L 16,23" stroke="#8d1c1c" strokeWidth="1.5" />
            </g>
          )}
        </g>

        {/* Floating clouds, sea grass and tropical stone accents */}
        <path d="M 460,370 Q 470,350 480,380" stroke="#25643a" strokeWidth="3" fill="none" />
        <ellipse cx="180" cy="305" rx="14" ry="7" fill="#697f8c" stroke="#485963" strokeWidth="1" />
      </svg>
    );
  };

  const getSceneSVG = () => {
    switch (levelId) {
      case 1:
        return renderCyberpunk();
      case 2:
        return renderFantasy();
      case 3:
        return renderCozy();
      case 4:
        return renderSpace();
      case 5:
        return renderIsland();
      default:
        return renderCyberpunk();
    }
  };

  return (
    <div className="relative w-full aspect-[5/4] bg-slate-950 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      {getSceneSVG()}

      {/* Show correct found indicators (in both images if rendered side by side) */}
      {foundIds.map((id) => {
        // Find matching definition
        const currentLvl = [1, 2, 3, 4, 5].includes(levelId) ? levelId : 1;
        const targetCoords = { x: 50, y: 50, radius: 5 }; // default fallback
        
        switch (currentLvl) {
          case 1: {
            const diff = [
              { id: "neon_sign", x: 18, y: 15, radius: 7 },
              { id: "flying_car", x: 75, y: 22, radius: 6 },
              { id: "cyber_cat", x: 34, y: 64, radius: 5 },
              { id: "billboard_logo", x: 85, y: 52, radius: 6 },
              { id: "vending_can", x: 52, y: 83, radius: 4 },
              { id: "rooftop_antenna", x: 48, y: 11, radius: 5 },
            ].find((d) => d.id === id);
            if (diff) Object.assign(targetCoords, diff);
            break;
          }
          case 2: {
            const diff = [
              { id: "magic_portal", x: 50, y: 35, radius: 8 },
              { id: "floating_crystal", x: 22, y: 24, radius: 6 },
              { id: "column_crack", x: 82, y: 45, radius: 5 },
              { id: "magic_book", x: 32, y: 78, radius: 6 },
              { id: "potion_bottle", x: 68, y: 74, radius: 5 },
              { id: "shield_crest", x: 7, y: 52, radius: 6 },
            ].find((d) => d.id === id);
            if (diff) Object.assign(targetCoords, diff);
            break;
          }
          case 3: {
            const diff = [
              { id: "wall_clock", x: 50, y: 19, radius: 6 },
              { id: "plant_leaf", x: 12, y: 42, radius: 6 },
              { id: "fridge_magnet", x: 88, y: 62, radius: 5 },
              { id: "shelf_mug", x: 68, y: 32, radius: 5 },
              { id: "window_weather", x: 28, y: 20, radius: 7 },
              { id: "table_cake", x: 46, y: 77, radius: 4 },
            ].find((d) => d.id === id);
            if (diff) Object.assign(targetCoords, diff);
            break;
          }
          case 4: {
            const diff = [
              { id: "radar_blips", x: 18, y: 48, radius: 6 },
              { id: "planet_ring", x: 50, y: 20, radius: 8 },
              { id: "pulpit_button", x: 48, y: 76, radius: 5 },
              { id: "helmet_visor", x: 78, y: 54, radius: 5 },
              { id: "screen_error", x: 32, y: 38, radius: 5 },
              { id: "ceiling_lamp", x: 86, y: 12, radius: 5 },
            ].find((d) => d.id === id);
            if (diff) Object.assign(targetCoords, diff);
            break;
          }
          case 5: {
            const diff = [
              { id: "chest_lock", x: 48, y: 78, radius: 6 },
              { id: "palm_cocos", x: 16, y: 32, radius: 5 },
              { id: "sea_ship", x: 85, y: 35, radius: 6 },
              { id: "beach_starfish", x: 31, y: 91, radius: 5 },
              { id: "island_crab", x: 64, y: 86, radius: 5 },
              { id: "flag_skull", x: 78, y: 18, radius: 6 },
            ].find((d) => d.id === id);
            if (diff) Object.assign(targetCoords, diff);
            break;
          }
        }

        return (
          <motion.div
            key={`marker-${id}`}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute rounded-full border-4 border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.5)] flex items-center justify-center cursor-pointer pointer-events-none"
            style={{
              left: `${targetCoords.x}%`,
              top: `${targetCoords.y}%`,
              width: `${targetCoords.radius * 2 * 1.3}%`,
              height: `${(targetCoords.radius * 2 * 1.3) * (5/4)}%`, // adjusts for vertical aspect 5:4 ratio
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </motion.div>
        );
      })}

      {/* Show active hint circle highlight */}
      {showHintId && (
        (() => {
          const currentLvl = [1, 2, 3, 4, 5].includes(levelId) ? levelId : 1;
          const targetCoords = { x: 50, y: 50, radius: 5 }; // default fallback
          
          switch (currentLvl) {
            case 1: {
              const diff = [
                { id: "neon_sign", x: 18, y: 15, radius: 7 },
                { id: "flying_car", x: 75, y: 22, radius: 6 },
                { id: "cyber_cat", x: 34, y: 64, radius: 5 },
                { id: "billboard_logo", x: 85, y: 52, radius: 6 },
                { id: "vending_can", x: 52, y: 83, radius: 4 },
                { id: "rooftop_antenna", x: 48, y: 11, radius: 5 },
              ].find((d) => d.id === showHintId);
              if (diff) Object.assign(targetCoords, diff);
              break;
            }
            case 2: {
              const diff = [
                { id: "magic_portal", x: 50, y: 35, radius: 8 },
                { id: "floating_crystal", x: 22, y: 24, radius: 6 },
                { id: "column_crack", x: 82, y: 45, radius: 5 },
                { id: "magic_book", x: 32, y: 78, radius: 6 },
                { id: "potion_bottle", x: 68, y: 74, radius: 5 },
                { id: "shield_crest", x: 7, y: 52, radius: 6 },
              ].find((d) => d.id === showHintId);
              if (diff) Object.assign(targetCoords, diff);
              break;
            }
            case 3: {
              const diff = [
                { id: "wall_clock", x: 50, y: 19, radius: 6 },
                { id: "plant_leaf", x: 12, y: 42, radius: 6 },
                { id: "fridge_magnet", x: 88, y: 62, radius: 5 },
                { id: "shelf_mug", x: 68, y: 32, radius: 5 },
                { id: "window_weather", x: 28, y: 20, radius: 7 },
                { id: "table_cake", x: 46, y: 77, radius: 4 },
              ].find((d) => d.id === showHintId);
              if (diff) Object.assign(targetCoords, diff);
              break;
            }
            case 4: {
              const diff = [
                { id: "radar_blips", x: 18, y: 48, radius: 6 },
                { id: "planet_ring", x: 50, y: 20, radius: 8 },
                { id: "pulpit_button", x: 48, y: 76, radius: 5 },
                { id: "helmet_visor", x: 78, y: 54, radius: 5 },
                { id: "screen_error", x: 32, y: 38, radius: 5 },
                { id: "ceiling_lamp", x: 86, y: 12, radius: 5 },
              ].find((d) => d.id === showHintId);
              if (diff) Object.assign(targetCoords, diff);
              break;
            }
            case 5: {
              const diff = [
                { id: "chest_lock", x: 48, y: 78, radius: 6 },
                { id: "palm_cocos", x: 16, y: 32, radius: 5 },
                { id: "sea_ship", x: 85, y: 35, radius: 6 },
                { id: "beach_starfish", x: 31, y: 91, radius: 5 },
                { id: "island_crab", x: 64, y: 86, radius: 5 },
                { id: "flag_skull", x: 78, y: 18, radius: 6 },
              ].find((d) => d.id === showHintId);
              if (diff) Object.assign(targetCoords, diff);
              break;
            }
          }

          return (
            <div
              className="absolute rounded-full border-4 border-dashed border-amber-400 bg-amber-500/20 animate-ping pointer-events-none"
              style={{
                left: `${targetCoords.x}%`,
                top: `${targetCoords.y}%`,
                width: `${targetCoords.radius * 2 * 1.5}%`,
                height: `${(targetCoords.radius * 2 * 1.5) * (5/4)}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })()
      )}
    </div>
  );
};
