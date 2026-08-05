/* ── WebAudio sound effects (no binary assets) ── */

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  try {
    const w = window as unknown as {
      AudioContext?: new () => AudioContext;
      webkitAudioContext?: new () => AudioContext;
    };
    const AC = window.AudioContext || w.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Call once on the first user gesture so subsequent sounds can play. */
export function unlockAudio(): void {
  ensureCtx();
}

/** Short white-noise burst (used for glitch / crash ambience). */
export function playStaticBurst(durationMs = 400): void {
  const c = ensureCtx();
  if (!c) return;
  const sampleRate = c.sampleRate;
  const len = Math.ceil((sampleRate * durationMs) / 1000);
  const buf = c.createBuffer(1, len, sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.08;

  const src = c.createBufferSource();
  src.buffer = buf;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durationMs / 1000);

  src.connect(gain).connect(c.destination);
  src.start(c.currentTime);
  src.stop(c.currentTime + durationMs / 1000);
}

/** Dissonant screeching sting + low boom (for JUMPSCARE). */
export function playJumpscareSting(): void {
  const c = ensureCtx();
  if (!c) return;

  const now = c.currentTime;

  // Two detuned sawtooth oscillators — screeching descent
  for (const freq of [880, 940]) {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    const g = c.createGain();
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(g).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Low sub boom
  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(80, now);
  sub.frequency.exponentialRampToValueAtTime(25, now + 0.4);
  const sg = c.createGain();
  sg.gain.setValueAtTime(0.35, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  sub.connect(sg).connect(c.destination);
  sub.start(now);
  sub.stop(now + 0.5);
}

/** Low-frequency thud (for FAKE_CRASH). */
export function playCrashThud(): void {
  const c = ensureCtx();
  if (!c) return;

  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.5);
  const g = c.createGain();
  g.gain.setValueAtTime(0.4, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(g).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}