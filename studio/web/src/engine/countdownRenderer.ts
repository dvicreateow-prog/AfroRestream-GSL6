/**
 * countdownRenderer.ts
 *
 * A self-contained countdown painter for the compositor canvas.
 *
 * Pure canvas 2D: no DOM lookups, no timers, no `Date.now()` inside `draw()`.
 * The draw loop owns the clock and passes `now` in, so a frame is a pure
 * function of (config, now) and can be replayed or unit-tested frame by frame.
 *
 * Geometry contract matches the rest of the overlay system: `x` / `y` are
 * PERCENTAGES of the canvas (0-100) and address the CENTRE of the timer block,
 * so 50/50 is dead centre regardless of output resolution.
 */

/** Serialisable state of one countdown. */
export interface CountdownConfig {
  /** Total run length in milliseconds. */
  durationMs: number;
  /** Timestamp the current run segment began, or null when idle. */
  startedAt: number | null;
  /** True while the run is held. */
  paused: boolean;
  /** Milliseconds already consumed by previous (unpaused) segments. */
  pausedElapsed: number;
  /** Backdrop fill: a hex string, or "Auto" to pick a neutral plate. */
  backgroundColor: string;
  /** Backdrop alpha, 0-1. 0 renders the digits straight over the video. */
  backgroundOpacity: number;
  /** Size multiplier applied to the whole block. */
  scale: number;
  /** Centre position, percent of canvas width. */
  x: number;
  /** Centre position, percent of canvas height. */
  y: number;
  /** Caption drawn above the digits. */
  label: string;
  /** Whether the caption is painted. */
  showLabel: boolean;
  /** Whether the host should advance to the next scene at zero. */
  autoSwitchOnEnd: boolean;
}

/** Durations offered by the duration picker: 0s / 10s / 30s / 1 / 2 / 3 / 10 / 15 min. */
export const COUNTDOWN_PRESETS_MS: number[] = [
  0, 10_000, 30_000, 60_000, 120_000, 180_000, 600_000, 900_000,
];

/** Sentinel accepted by `backgroundColor`, meaning "choose a plate for me". */
const AUTO_COLOR = 'auto';

/** Plate used when `backgroundColor` is "Auto". */
const AUTO_PLATE = '#0E1116';

/** Digits go amber inside the final ten seconds. */
const WARNING_COLOR = '#FFB020';

/** Digits go red once the run reaches zero. */
const FINISHED_COLOR = '#FF5A5F';

/** Threshold for the warning state. */
const WARNING_MS = 10_000;

const FONT_STACK =
  '"Inter", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export const DEFAULT_COUNTDOWN: CountdownConfig = {
  durationMs: 300_000,
  startedAt: null,
  paused: false,
  pausedElapsed: 0,
  backgroundColor: 'Auto',
  backgroundOpacity: 0.55,
  scale: 1,
  x: 50,
  y: 50,
  label: 'Starting soon',
  showLabel: true,
  autoSwitchOnEnd: false,
};

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return value < min ? min : value > max ? max : value;
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Parse `#rgb`, `#rrggbb` or `#rrggbbaa` (alpha ignored). Returns null on junk. */
function parseHex(input: string): Rgb | null {
  const raw = input.trim().replace(/^#/, '');
  const isShort = raw.length === 3;
  if (!isShort && raw.length !== 6 && raw.length !== 8) return null;
  if (!/^[0-9a-fA-F]+$/.test(raw)) return null;
  const hex = isShort
    ? raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2]
    : raw.slice(0, 6);
  const value = Number.parseInt(hex, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

/** Relative luminance, 0 (black) to 1 (white), sRGB linearised. */
function luminance(color: Rgb): number {
  const channel = (raw: number): number => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

const PLATE_FALLBACK: Rgb = { r: 14, g: 17, b: 22 };

/** Resolve the configured plate colour, honouring the "Auto" sentinel. */
function resolvePlate(backgroundColor: string): Rgb {
  if (backgroundColor.trim().toLowerCase() === AUTO_COLOR) {
    return parseHex(AUTO_PLATE) ?? PLATE_FALLBACK;
  }
  return parseHex(backgroundColor) ?? parseHex(AUTO_PLATE) ?? PLATE_FALLBACK;
}

/** Ink that stays readable on the given plate. */
function autoInk(plate: Rgb, plateAlpha: number): string {
  // A near-transparent plate means the digits sit on unknown video: stay white.
  if (plateAlpha < 0.35) return '#FFFFFF';
  return luminance(plate) > 0.5 ? '#0B0D12' : '#FFFFFF';
}

function rgba(color: Rgb, alpha: number): string {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`;
}

/** Rounded-rectangle path, written by hand so no `roundRect` lib support is required. */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Milliseconds left on the clock at `now`, never below zero. */
export function remainingMs(c: CountdownConfig, now: number): number {
  const duration = Math.max(0, finiteOr(c.durationMs, 0));
  const banked = Math.max(0, finiteOr(c.pausedElapsed, 0));
  const running = c.startedAt !== null && !c.paused ? Math.max(0, now - c.startedAt) : 0;
  return Math.max(0, duration - banked - running);
}

/** `M:SS`, widening to `H:MM:SS` once an hour or more is left. */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, finiteOr(ms, 0)) / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
  return `${minutes}:${ss}`;
}

export class CountdownRenderer {
  private cfg: CountdownConfig;

  /** Last clock value seen, so `finished` can answer without a fresh timestamp. */
  private lastNow = 0;

  constructor(cfg?: Partial<CountdownConfig>) {
    this.cfg = CountdownRenderer.sanitize({ ...DEFAULT_COUNTDOWN, ...(cfg ?? {}) });
  }

  private static sanitize(next: CountdownConfig): CountdownConfig {
    const startedAt =
      next.startedAt !== null && Number.isFinite(next.startedAt) ? next.startedAt : null;
    return {
      durationMs: Math.max(0, finiteOr(next.durationMs, DEFAULT_COUNTDOWN.durationMs)),
      startedAt,
      paused: Boolean(next.paused),
      pausedElapsed: Math.max(0, finiteOr(next.pausedElapsed, 0)),
      backgroundColor: next.backgroundColor || DEFAULT_COUNTDOWN.backgroundColor,
      backgroundOpacity: clamp(next.backgroundOpacity, 0, 1),
      scale: clamp(next.scale, 0.2, 4),
      x: clamp(next.x, 0, 100),
      y: clamp(next.y, 0, 100),
      label: typeof next.label === 'string' ? next.label : '',
      showLabel: Boolean(next.showLabel),
      autoSwitchOnEnd: Boolean(next.autoSwitchOnEnd),
    };
  }

  set(patch: Partial<CountdownConfig>): void {
    this.cfg = CountdownRenderer.sanitize({ ...this.cfg, ...patch });
  }

  get config(): CountdownConfig {
    return { ...this.cfg };
  }

  /** Begin a fresh run at `now`, discarding any banked time. */
  start(now: number): void {
    this.lastNow = now;
    this.cfg = { ...this.cfg, startedAt: now, paused: false, pausedElapsed: 0 };
  }

  /** Hold the clock, banking the elapsed segment. */
  pause(now: number): void {
    this.lastNow = now;
    if (this.cfg.paused || this.cfg.startedAt === null) return;
    const banked = this.cfg.pausedElapsed + Math.max(0, now - this.cfg.startedAt);
    this.cfg = { ...this.cfg, paused: true, pausedElapsed: banked, startedAt: now };
  }

  /** Release a held clock; the remaining time carries over. */
  resume(now: number): void {
    this.lastNow = now;
    if (!this.cfg.paused) return;
    this.cfg = { ...this.cfg, paused: false, startedAt: now };
  }

  /** Return to the idle, full-duration state. */
  reset(): void {
    this.cfg = { ...this.cfg, startedAt: null, paused: false, pausedElapsed: 0 };
  }

  /** True once a started run has reached zero, as of the last observed clock. */
  get finished(): boolean {
    const started = this.cfg.startedAt !== null || this.cfg.pausedElapsed > 0;
    return started && remainingMs(this.cfg, this.lastNow) <= 0;
  }

  /** Paint one frame. Call from the compositor's draw loop. */
  draw(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, now: number): void {
    if (canvasW <= 0 || canvasH <= 0) return;
    this.lastNow = now;

    const cfg = this.cfg;
    const left = remainingMs(cfg, now);
    const started = cfg.startedAt !== null || cfg.pausedElapsed > 0;
    const isFinished = started && left <= 0;
    const isWarning = !isFinished && left <= WARNING_MS;
    const text = formatCountdown(left);

    const digitSize = Math.max(14, canvasH * 0.17 * cfg.scale);
    const labelSize = Math.max(10, digitSize * 0.2);
    const digitFont = `700 ${digitSize}px ${FONT_STACK}`;
    const labelFont = `600 ${labelSize}px ${FONT_STACK}`;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = digitFont;

    const textWidth = ctx.measureText(text).width;
    const padX = digitSize * 0.44;
    const padY = digitSize * 0.3;
    const boxW = textWidth + padX * 2;
    const boxH = digitSize * 1.14 + padY * 2;
    const cx = (cfg.x / 100) * canvasW;
    const cy = (cfg.y / 100) * canvasH;
    const boxX = cx - boxW / 2;
    const boxY = cy - boxH / 2;

    const plate = resolvePlate(cfg.backgroundColor);
    const plateAlpha = cfg.backgroundOpacity;

    if (plateAlpha > 0.002) {
      roundedRectPath(ctx, boxX, boxY, boxW, boxH, Math.min(boxW, boxH) * 0.22);
      ctx.fillStyle = rgba(plate, plateAlpha);
      ctx.fill();
    }

    const label = cfg.label.trim();
    if (cfg.showLabel && label.length > 0) {
      const labelY = Math.max(labelSize, boxY - labelSize * 0.85);
      ctx.font = labelFont;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = labelSize * 0.5;
      ctx.shadowOffsetY = labelSize * 0.08;
      ctx.fillText(label.toUpperCase(), cx, labelY);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    // A one-second breathe through the final stretch. Driven by `now`, so the
    // frame stays reproducible for a given timestamp.
    const pulse =
      isWarning || isFinished
        ? 0.78 + 0.22 * (0.5 + 0.5 * Math.cos((now / 1000) * Math.PI * 2))
        : 1;

    ctx.font = digitFont;
    ctx.fillStyle = isFinished
      ? FINISHED_COLOR
      : isWarning
        ? WARNING_COLOR
        : autoInk(plate, plateAlpha);
    ctx.globalAlpha = pulse;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = digitSize * 0.14;
    ctx.shadowOffsetY = digitSize * 0.03;
    ctx.fillText(text, cx, cy + digitSize * 0.02);
    ctx.restore();
  }
}
