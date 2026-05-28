/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let soundEnabled = true;

export function getSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
}

/**
 * Standard flat button/panel UI click sound
 */
export function playClickSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1000, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/**
 * Success/Spot found sound: A beautiful, sparkling high chime
 */
export function playCorrectSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Sparkling arpeggio: C6, E6, G6, C7
  const freqs = [1046.50, 1318.51, 1567.98, 2093.00];

  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + index * 0.03);

    gain.gain.setValueAtTime(0, now + index * 0.03);
    gain.gain.linearRampToValueAtTime(0.06, now + index * 0.03 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.03 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.03);
    osc.stop(now + index * 0.03 + 0.3);
  });
}

/**
 * Error/Incorrect click sound: A soft, low-pitched buzz
 */
export function playIncorrectSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.setValueAtTime(120, now + 0.05);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * Miracle magical sound when hint is sprayed
 */
export function playHintSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const steps = 6;
  
  for (let i = 0; i < steps; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = i * 0.06;
    const freq = 600 + (steps - i) * 250; // Descending magic scale

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + delay);
    
    // Slight vibrato
    osc.frequency.linearRampToValueAtTime(freq - 100, now + delay + 0.2);

    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(0.04, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.3);
  }
}

/**
 * Magical level completion fanfare!
 * A rich triumphant chord progression
 */
export function playLevelCompletionSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Major chord progression (C major to F major to G major to C major)
  const progressions = [
    // Chord 1 (C Major): C4, E4, G4, C5 (at time 0.0)
    { time: 0.0, notes: [261.63, 329.63, 392.00, 523.25], duration: 0.25 },
    // Chord 2 (F Major): F4, A4, C5, F5 (at time 0.25)
    { time: 0.25, notes: [349.23, 440.00, 523.25, 698.46], duration: 0.25 },
    // Chord 3 (G Major): G4, B4, D5, G5 (at time 0.5)
    { time: 0.5, notes: [392.00, 493.88, 587.33, 783.99], duration: 0.25 },
    // Chord 4 (C Major triumphant ring!): E5, G5, C6 (at time 0.75)
    { time: 0.75, notes: [659.25, 783.99, 1046.50], duration: 0.7 }
  ];

  progressions.forEach((prog) => {
    prog.notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft majestic brass (triangle wave)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + prog.time);

      gain.gain.setValueAtTime(0, now + prog.time);
      gain.gain.linearRampToValueAtTime(0.04, now + prog.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + prog.time + prog.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + prog.time);
      osc.stop(now + prog.time + prog.duration);
    });
  });
}
