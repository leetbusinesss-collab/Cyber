/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Faction, GameState, Structure, Upgrade, Protocol } from "../types";

// Helper to check if an upgrade is purchased
export function isPurchased(state: GameState, id: string): boolean {
  return state.upgrades.some((u) => u.id === id && u.isPurchased);
}

// Format numbers nicely in futuristic scientific layout
export function formatSci(num: number): string {
  if (num === 0) return "0";
  if (num < 1000) return num.toFixed(1).replace(/\.0$/, "");
  if (num < 1000000) {
    return num.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  }
  const exp = Math.floor(Math.log10(num));
  const base = num / Math.pow(10, exp);
  return `${base.toFixed(2)}e${exp}`;
}

// Format seconds into digital clock format HH:MM:SS
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [
    h > 0 ? h.toString().padStart(2, "0") : null,
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ]
    .filter(Boolean)
    .join(":");
}

// Calculate the production profile of each structure
export function getStructureProduction(
  structure: Structure,
  state: GameState,
  activeProtocols: Protocol[],
  secondsSinceLastClick: number
): number {
  if (structure.count === 0) return 0;

  let prod = structure.count * structure.baseProduction;

  // 1. Structure specific upgrades
  if (structure.id === "str_node" && isPurchased(state, "upg_node_1")) {
    prod *= 2.0;
  }
  if (structure.id === "str_drone" && isPurchased(state, "upg_drone_1")) {
    prod *= 2.0;
  }
  if (structure.id === "str_grid" && isPurchased(state, "upg_grid_1")) {
    prod *= 2.0;
  }

  // Faction locked structure boosts
  if (state.currentFaction === Faction.SYNDICATE && isPurchased(state, "upg_synd_3")) {
    if (structure.id === "str_reactor" || structure.id === "str_transmuter") {
      prod *= 2.5; // +150% boost
    }
  }
  if (state.currentFaction === Faction.SINGULARITY_AI && isPurchased(state, "upg_ai_3")) {
    if (structure.id === "str_singularity" || structure.id === "str_dyson") {
      prod *= 3.0; // +200% boost
    }
  }

  // 2. Faction general boosts
  if (state.currentFaction === Faction.SINGULARITY_AI) {
    // AI passive multiplier increase based on number of buildings purchased (Upgrade 2)
    if (isPurchased(state, "upg_ai_2")) {
      const totalBuildings = state.structures.reduce((acc, curr) => acc + curr.count, 0);
      prod *= (1 + totalBuildings * 0.015);
    }
    // AI Idle check (Upgrade 1)
    if (isPurchased(state, "upg_ai_1") && secondsSinceLastClick > 0) {
      const idleBonus = Math.min(1.0, secondsSinceLastClick * 0.005); // Grows by 0.5% per second idle, up to +100%
      prod *= (1 + idleBonus);
    }
  }

  if (state.currentFaction === Faction.REBEL_NOMADS) {
    // Rebel click intensity boost: each click this session accelerates structures (Upgrade 2)
    if (isPurchased(state, "upg_reb_2")) {
      prod *= (1 + state.stats.clicksThisTranscending * 0.001);
    }
  }

  return prod;
}

// Calculate total Production per Second (TPS) across all structures
export function calculateTPS(
  state: GameState,
  activeProtocols: Protocol[],
  secondsSinceLastClick: number
): number {
  let totalProd = 0;

  for (const str of state.structures) {
    totalProd += getStructureProduction(str, state, activeProtocols, secondsSinceLastClick);
  }

  // 3. Global general upgrades
  if (isPurchased(state, "upg_global_1")) {
    totalProd *= 1.25;
  }
  if (isPurchased(state, "upg_global_2")) {
    totalProd *= 1.35;
  }
  if (isPurchased(state, "upg_core_4")) {
    totalProd *= 1.50; // Permanent Core upgrade +50%
  }

  // 4. Singularity Core boosts (5% core prestige boost, upgraded to 7% with upg_core_1)
  const coreMultiplier = isPurchased(state, "upg_core_1") ? 0.07 : 0.05;
  totalProd *= (1 + state.singularityCores * coreMultiplier);

  // 5. Active Protocol buffs
  const isPulseActive = activeProtocols.some((p) => p.id === "pr_subnet" && p.activeTimeLeft > 0);
  if (isPulseActive) {
    totalProd *= 5.0; // +400%
  }

  const isLearningActive = activeProtocols.some((p) => p.id === "pr_learning" && p.activeTimeLeft > 0);
  if (isLearningActive) {
    totalProd *= 7.0; // +600%
  }

  return totalProd;
}

// Calculate Click Power
export function calculateClickPower(
  state: GameState,
  tps: number,
  activeProtocols: Protocol[]
): number {
  let power = 1;

  // General click upgrades
  if (isPurchased(state, "upg_click_1")) {
    power += 1;
  }
  if (isPurchased(state, "upg_click_2")) {
    power += tps * 0.10; // 10% of current TPS is added to click power
  }

  // Syndicate Faction Upgrade: clicking scales with total buildings (Upgrade 2)
  if (state.currentFaction === Faction.SYNDICATE && isPurchased(state, "upg_synd_2")) {
    const totalBuildings = state.structures.reduce((acc, curr) => acc + curr.count, 0);
    power += totalBuildings * 1.5; // +1.5 points of power per building
  }

  // Permanent Core Upgrade: +3% of TPS added to clicks
  if (isPurchased(state, "upg_core_2")) {
    power += tps * 0.03;
  }

  // Active Protocols
  const isOverdriveActive = activeProtocols.some((p) => p.id === "pr_overdrive" && p.activeTimeLeft > 0);
  if (isOverdriveActive) {
    power *= 21.0; // +2000% click boost
  }

  return Math.max(1, power);
}

// Calculate Singularity Cores gained upon prestige (Transcendence)
export function getPendingCores(energyEarnedThisRun: number): number {
  if (energyEarnedThisRun < 1000000) return 0;
  // Satisfying curve: 1 million nano-energy provides 1 core, scaling progressively onwards
  return Math.floor(Math.pow(energyEarnedThisRun / 1000000, 0.45));
}

// Calculate exact energy required to unlock the next prestige core
export function getEnergyForNextCore(energyEarnedThisRun: number): number {
  const currentCores = getPendingCores(energyEarnedThisRun);
  const nextCores = currentCores + 1;
  return Math.pow(nextCores, 1 / 0.45) * 1000000;
}
