/**
 * Types representing the "Spot the Differences: Worlds" (Найди Отличия: Миры) game state.
 */

export type Category = "Cyberpunk" | "Fantasy" | "Cozy" | "Space" | "Island";

export interface Difference {
  id: string;
  name: string;        // Name in Russian for the log/achievements
  nameEn: string;      // Name in English
  x: number;           // Target X coordinate (0 - 100 percent)
  y: number;           // Target Y coordinate (0 - 100 percent)
  radius: number;      // Tapping tolerance (0 - 100 percent)
  description: string; // Description of difference for details
}

export interface Level {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: Category;
  totalDifferences: number;
  differences: Difference[];
  difficulty: "Легко" | "Средне" | "Сложно";
  difficultyEn: "Easy" | "Medium" | "Hard";
}

export interface UserLevelProgress {
  levelId: number;
  completed: boolean;
  stars: number;         // 0 to 3
  bestTime: number;      // in seconds
  foundDifferenceIds: string[];
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  showTimer: boolean;
  magnifierEnabled: boolean; // Enables the magnifying round lens
  language: "ru" | "en";
  vibrationEnabled: boolean; // For Android target vibration feedback
}

export interface PlayerProfile {
  levelsProgress: Record<number, UserLevelProgress>;
  hintsCount: number;
  totalScore: number;
  comboCount: number;
  maxCombo: number;
  lastActiveLevelId: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  unlocked: boolean;
  icon: string; // Lucide icon name
  progress: number;
  maxProgress: number;
}
