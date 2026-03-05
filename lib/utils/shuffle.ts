/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 * Seeded with a string key for deterministic per-respondent shuffling.
 */
export function shuffle<T>(array: T[], seed?: string): T[] {
  const result = [...array];
  let m = result.length;

  // Simple seeded random (deterministic if seed provided)
  let rng: () => number;
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    rng = () => {
      h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
      h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
      h = (h ^ (h >>> 16)) >>> 0;
      return h / 0x100000000;
    };
  } else {
    rng = Math.random;
  }

  while (m) {
    const i = Math.floor(rng() * m--);
    [result[m], result[i]] = [result[i], result[m]];
  }

  return result;
}
