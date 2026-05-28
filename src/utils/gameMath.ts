/**
 * Math and utility functions for Spot the Differences: Worlds.
 */

/**
 * Format seconds into a friendly MM:SS string.
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Calculate star rating (1 to 3) based on time taken (seconds) and amount of wrong clicks/hints.
 * - 3 Stars: Solved under 50s with less than 3 wrong clicks, no hints.
 * - 2 Stars: Solved under 120s with less than 6 wrong clicks.
 * - 1 Star: Otherwise.
 */
export function calculateStars(
  timeInSeconds: number,
  wrongClicks: number,
  hintsUsed: number
): number {
  if (timeInSeconds <= 55 && wrongClicks <= 2 && hintsUsed === 0) {
    return 3;
  }
  if (timeInSeconds <= 130 && wrongClicks <= 5) {
    return 2;
  }
  return 1;
}

/**
 * Calculated awarded points for finding a difference.
 * Base points is 100. Combos give 20% multiplier.
 */
export function calculateScore(combo: number): number {
  const base = 100;
  return base + Math.min(100, (combo - 1) * 20); // cap combo bonus at +100 points
}
