// Clockwork Twins: a tiny seeded random generator.
// One job: deterministic numbers, so a screenshot staged with a seed always
// renders the same frame.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

// A stable per-level seed, so the same level always draws the same scene.
export function levelSeed(levelIndex) {
  return 20261121 + levelIndex * 7919;
}
