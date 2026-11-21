// Clockwork Twins: every sound is synthesised with WebAudio.
// One job: the little pops, buzzes and chimes. No audio files, no network.
let ctx = null;
let muted = false;

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

export function ensureAudio() {
  const a = audio();
  if (a && a.state === 'suspended') a.resume().catch(() => {});
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function tone(freq, startAt, dur, type, vol) {
  if (muted) return;
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, a.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, a.currentTime + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + startAt + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(a.currentTime + startAt);
  osc.stop(a.currentTime + startAt + dur + 0.05);
}

export function soundClick() {
  tone(620, 0, 0.06, 'sine', 0.08);
}

// A satisfying two-note pop when a difference is found.
export function soundFind() {
  tone(523.25, 0, 0.12, 'triangle', 0.22);
  tone(783.99, 0.07, 0.18, 'triangle', 0.22);
  tone(1046.5, 0.14, 0.22, 'sine', 0.14);
}

// A low buzz for a wrong click.
export function soundMiss() {
  tone(140, 0, 0.16, 'sawtooth', 0.1);
  tone(110, 0.05, 0.18, 'sawtooth', 0.08);
}

// A short arpeggio when a level is cleared.
export function soundLevelClear() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.24, 'triangle', 0.2));
}

// A warm chord when the whole game is finished.
export function soundWin() {
  [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.4, 'triangle', 0.16));
}

export function soundHint() {
  tone(880, 0, 0.1, 'sine', 0.12);
  tone(1174.66, 0.08, 0.14, 'sine', 0.1);
}
