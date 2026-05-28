/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Faction {
  NEUTRAL = "NEUTRAL",
  SYNDICATE = "SYNDICATE", // Megacorporation - active clicking, quick bursts, credits
  SINGULARITY_AI = "SINGULARITY_AI", // AI Singularity - deep idle, automated progression, nanobots
  REBEL_NOMADS = "REBEL_NOMADS", // Cosmic Rebels - entropy, chaotic variables, temporal warp
}

export interface Structure {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  count: number;
  baseProduction: number; // nano-energy per second
  category: "nanotech" | "energy" | "data" | "space";
  icon: string; // Lucide icon name
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: "energy" | "cores" | "faction_points";
  factionLock?: Faction;
  isUnlocked: boolean;
  isPurchased: boolean;
  effect: string; // Brief summary of effect, e.g. "X2 click", "+10% node production"
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  cooldown: number; // in seconds
  activeTimeLeft: number; // in seconds, > 0 if active
  cooldownLeft: number; // in seconds
  cost: number; // energy cost
  factionLock?: Faction;
  icon: string;
}

export interface GameStats {
  totalClicks: number;
  totalEnergyEarned: number;
  totalCoresEarned: number;
  timePlayed: number; // in seconds
  timeThisTranscending: number; // in seconds
  transcendCount: number;
  clicksThisTranscending: number;
}

export interface GameState {
  nanoEnergy: number;
  singularityCores: number;
  factionPoints: number;
  currentFaction: Faction;
  structures: Structure[];
  upgrades: Upgrade[];
  stats: GameStats;
  lastTick: number; // Timestamp of last update for idle progression
}
