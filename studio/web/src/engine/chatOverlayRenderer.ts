/**
 * chatOverlayRenderer — paints live chat messages onto the compositor canvas.
 *
 * Two placement modes, mirroring the documented on-stream chat behaviour:
 *
 *   reserved  The panel occupies a fixed band down the right edge whose width is
 *             `397 * c` where `c = canvasW / 1280` (the layout reference width).
 *             Callers use `reservedChatWidth()` to shrink the source layout by the
 *             same amount so video never sits underneath the chat.
 *   freemove  The panel is placed anywhere over the video using x/y/w/h, all of
 *             which are percentages of the canvas (0-100).
 *
 * Rendering is pure canvas 2D — no DOM, no images, no timers. Every time-dependent
 * value comes from the `now` argument handed to `draw()`, so a given message list and
 * a given `now` always produce the same frame (important for deterministic tests and
 * for recording passes that render faster or slower than wall-clock).
 */

export interface ChatOverlayMessage {
  id: string;
  author: string;
  authorColor: string;
  text: string;
  platform: 'youtube' | 'twitch' | 'facebook' | 'x' | 'studio';
  at: number;
}

export interface ChatOverlayConfig {
  mode: 'reserved' | 'freemove';
  /** percent of canvas width, freemove only */
  x: number;
  /** percent of canvas height, freemove only */
  y: number;
  /** percent of canvas width, freemove only */
  w: number;
  /** percent of canvas height, freemove only */
  h: number;
  maxMessages: number;
  /** 0 = messages never expire */
  messageLifetimeMs: number;
  showAvatars: boolean;
  showPlatform: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  fontScale: number;
}

export const DEFAULT_CHAT_OVERLAY: ChatOverlayConfig = {
  mode: 'reserved',
  x: 66,
  y: 6,
  w: 30,
  h: 82,
  maxMessages: 6,
  messageLifetimeMs: 20000,
  showAvatars: true,
  showPlatform: true,
  backgroundColor: '#0d1117',
  backgroundOpacity: 0.72,
  fontScale: 1,
};

/** Layout reference width the reserved-space math is expressed against. */
const REFERENCE_WIDTH = 1280;
/** Reserved-space chat band, in reference pixels. */
const RESERVED_BAND = 397;
/** How long a message spends fading out at the end of its life. */
const FADE_OUT_MS = 800;
/** Short fade-in so arrivals do not pop. */
const FADE_IN_MS = 160;
/** Hard cap on retained history, independent of maxMessages. */
const BUFFER_LIMIT = 240;

const FONT_STACK = '"Inter", "Segoe UI", Roboto, system-ui, sans-serif';

const PLATFORM_LABEL: Record<ChatOverlayMessage['platform'], string> = {
  youtube: 'YT',
  twitch: 'TW',
  facebook: 'FB',
  x: 'X',
  studio: 'LIVE',
};

const PLATFORM_COLOR: Record<ChatOverlayMessage['platform'], string> = {
  youtube: '#ff0a3c',
  twitch: '#9147ff',
  facebook: '#0866ff',
  x: '#4a5058',
  studio: '#2f7cf6',
};

/** Width in canvas pixels that the reserved-space chat band claims. */
export function reservedChatWidth(canvasW: number): number {
  return RESERVED_BAND * (canvasW / REFERENCE_WIDTH);
}

export interface ChatOverlayBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

type TokenKind = 'badge' | 'author' | 'word';

interface Token {
  kind: TokenKind;
  text: string;
  color: string;
  w: number;
}

interface Line {
  tokens: Token[];
  offsets: number[];
}

interface Placed {
  msg: ChatOverlayMessage;
  lines: Line[];
  height: number;
  alpha: number;
}

interface Metrics {
  scale: number;
  font: number;
  small: number;
  line: number;
  pad: number;
  gap: number;
  radius: number;
  avatar: number;
  avatarGap: number;
  space: number;
}

function clampNumber(value: number, lo: number, hi: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return value < lo ? lo : value > hi ? hi : value;
}

function normalize(base: ChatOverlayConfig, patch: Partial<ChatOverlayConfig>): ChatOverlayConfig {
  const merged: ChatOverlayConfig = { ...base, ...patch };
  return {
    mode: merged.mode === 'freemove' ? 'freemove' : 'reserved',
    x: clampNumber(merged.x, 0, 100, base.x),
    y: clampNumber(merged.y, 0, 100, base.y),
    w: clampNumber(merged.w, 6, 100, base.w),
    h: clampNumber(merged.h, 6, 100, base.h),
    maxMessages: Math.round(clampNumber(merged.maxMessages, 1, 40, base.maxMessages)),
    messageLifetimeMs: Math.round(clampNumber(merged.messageLifetimeMs, 0, 3_600_000, base.messageLifetimeMs)),
    showAvatars: merged.showAvatars !== false,
    showPlatform: merged.showPlatform !== false,
    backgroundColor: typeof merged.backgroundColor === 'string' && merged.backgroundColor.length > 0
      ? merged.backgroundColor
      : base.backgroundColor,
    backgroundOpacity: clampNumber(merged.backgroundOpacity, 0, 1, base.backgroundOpacity),
    fontScale: clampNumber(merged.fontScale, 0.5, 3, base.fontScale),
  };
}

function parseHex(color: string): [number, number, number] | null {
  const raw = color.trim().replace('#', '');
  if (raw.length === 3) {
    const r = Number.parseInt(raw[0] + raw[0], 16);
    const g = Number.parseInt(raw[1] + raw[1], 16);
    const b = Number.parseInt(raw[2] + raw[2], 16);
    return Number.isNaN(r + g + b) ? null : [r, g, b];
  }
  if (raw.length === 6 || raw.length === 8) {
    const r = Number.parseInt(raw.slice(0, 2), 16);
    const g = Number.parseInt(raw.slice(2, 4), 16);
    const b = Number.parseInt(raw.slice(4, 6), 16);
    return Number.isNaN(r + g + b) ? null : [r, g, b];
  }
  return null;
}

/** Pick black or white ink for text sitting on `color`. */
function inkOn(color: string): string {
  const rgb = parseHex(color);
  if (!rgb) return '#ffffff';
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return lum > 0.62 ? '#10141b' : '#ffffff';
}

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

export class ChatOverlayRenderer {
  private cfg: ChatOverlayConfig;
  private messages: ChatOverlayMessage[] = [];
  private measured = new Map<string, number>();

  constructor(cfg?: Partial<ChatOverlayConfig>) {
    this.cfg = normalize(DEFAULT_CHAT_OVERLAY, cfg ?? {});
  }

  set(patch: Partial<ChatOverlayConfig>): void {
    this.cfg = normalize(this.cfg, patch);
    this.measured.clear();
  }

  get config(): ChatOverlayConfig {
    return { ...this.cfg };
  }

  push(msg: ChatOverlayMessage): void {
    const existing = this.messages.findIndex((m) => m.id === msg.id);
    if (existing !== -1) this.messages.splice(existing, 1);
    this.messages.push(msg);
    if (this.messages.length > BUFFER_LIMIT) {
      this.messages.splice(0, this.messages.length - BUFFER_LIMIT);
    }
  }

  clear(): void {
    this.messages = [];
  }

  /** The pixel rect the panel occupies on a canvas of this size. */
  box(canvasW: number, canvasH: number): ChatOverlayBox {
    const c = canvasW / REFERENCE_WIDTH;
    if (this.cfg.mode === 'reserved') {
      const inset = Math.round(24 * c);
      const w = Math.round(reservedChatWidth(canvasW)) - inset;
      return { x: canvasW - w - inset, y: inset, w, h: canvasH - inset * 2 };
    }
    const w = (this.cfg.w / 100) * canvasW;
    const h = (this.cfg.h / 100) * canvasH;
    const x = Math.min((this.cfg.x / 100) * canvasW, canvasW - w);
    const y = Math.min((this.cfg.y / 100) * canvasH, canvasH - h);
    return { x: Math.max(0, x), y: Math.max(0, y), w, h };
  }

  draw(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, now: number): void {
    if (canvasW <= 0 || canvasH <= 0) return;
    const live = this.visible(now);
    if (live.length === 0) return;

    const box = this.box(canvasW, canvasH);
    if (box.w <= 8 || box.h <= 8) return;

    const m = this.metrics(canvasH);
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    const indent = this.cfg.showAvatars ? m.avatar + m.avatarGap : 0;
    const textWidth = Math.max(m.font * 3, box.w - m.pad * 2 - indent);

    // Newest first; we stack upward from the bottom of the box so the freshest
    // message always lands on the same baseline no matter how tall the others are.
    const placed: Placed[] = [];
    let consumed = 0;
    for (let i = live.length - 1; i >= 0; i--) {
      const msg = live[i];
      const lines = this.layout(ctx, msg, textWidth, m);
      const height = lines.length * m.line + m.pad * 2;
      if (consumed + height > box.h && placed.length > 0) break;
      placed.push({ msg, lines, height, alpha: this.fade(msg, now) });
      consumed += height + m.gap;
    }

    let bottom = box.y + box.h;
    for (const entry of placed) {
      const top = bottom - entry.height;
      this.paint(ctx, entry, box.x, top, box.w, indent, m);
      bottom = top - m.gap;
      if (bottom < box.y) break;
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------- internals

  private visible(now: number): ChatOverlayMessage[] {
    const life = this.cfg.messageLifetimeMs;
    const fresh = life > 0
      ? this.messages.filter((msg) => now - msg.at < life)
      : this.messages;
    return fresh.length > this.cfg.maxMessages
      ? fresh.slice(fresh.length - this.cfg.maxMessages)
      : fresh;
  }

  private fade(msg: ChatOverlayMessage, now: number): number {
    const age = Math.max(0, now - msg.at);
    const life = this.cfg.messageLifetimeMs;
    const enter = FADE_IN_MS > 0 ? Math.min(1, age / FADE_IN_MS) : 1;
    if (life <= 0) return enter;
    const remaining = life - age;
    const exit = remaining >= FADE_OUT_MS ? 1 : Math.max(0, remaining / FADE_OUT_MS);
    return Math.min(enter, exit);
  }

  private metrics(canvasH: number): Metrics {
    const scale = canvasH / 1080;
    const font = Math.max(11, Math.round(21 * scale * this.cfg.fontScale));
    return {
      scale,
      font,
      small: Math.max(8, Math.round(font * 0.62)),
      line: Math.round(font * 1.34),
      pad: Math.round(font * 0.62),
      gap: Math.round(font * 0.42),
      radius: Math.round(font * 0.6),
      avatar: Math.round(font * 1.55),
      avatarGap: Math.round(font * 0.52),
      space: 0,
    };
  }

  private font(kind: TokenKind, m: Metrics): string {
    if (kind === 'badge') return `700 ${m.small}px ${FONT_STACK}`;
    if (kind === 'author') return `600 ${m.font}px ${FONT_STACK}`;
    return `400 ${m.font}px ${FONT_STACK}`;
  }

  private width(ctx: CanvasRenderingContext2D, kind: TokenKind, text: string, m: Metrics): number {
    const key = `${kind}|${m.font}|${text}`;
    const hit = this.measured.get(key);
    if (hit !== undefined) return hit;
    ctx.font = this.font(kind, m);
    const w = ctx.measureText(text).width;
    if (this.measured.size > 4000) this.measured.clear();
    this.measured.set(key, w);
    return w;
  }

  /** Greedy word-wrap across mixed badge/author/word runs. */
  private layout(
    ctx: CanvasRenderingContext2D,
    msg: ChatOverlayMessage,
    maxWidth: number,
    m: Metrics,
  ): Line[] {
    const tokens: Token[] = [];
    if (this.cfg.showPlatform) {
      const label = PLATFORM_LABEL[msg.platform];
      const w = this.width(ctx, 'badge', label, m) + m.small * 1.1;
      tokens.push({ kind: 'badge', text: label, color: PLATFORM_COLOR[msg.platform], w });
    }
    const author = msg.author.trim().length > 0 ? msg.author.trim() : 'Guest';
    tokens.push({
      kind: 'author',
      text: `${author}:`,
      color: msg.authorColor,
      w: this.width(ctx, 'author', `${author}:`, m),
    });
    for (const word of msg.text.split(/\s+/)) {
      if (word.length === 0) continue;
      for (const piece of this.split(ctx, word, maxWidth, m)) {
        tokens.push({ kind: 'word', text: piece, color: '#ffffff', w: this.width(ctx, 'word', piece, m) });
      }
    }

    const space = this.width(ctx, 'word', ' ', m);
    const lines: Line[] = [];
    let current: Token[] = [];
    let offsets: number[] = [];
    let cursor = 0;
    for (const token of tokens) {
      const lead = current.length === 0 ? 0 : space;
      if (current.length > 0 && cursor + lead + token.w > maxWidth) {
        lines.push({ tokens: current, offsets });
        current = [];
        offsets = [];
        cursor = 0;
      }
      const at = cursor + (current.length === 0 ? 0 : space);
      current.push(token);
      offsets.push(at);
      cursor = at + token.w;
    }
    if (current.length > 0) lines.push({ tokens: current, offsets });
    return lines;
  }

  /** Break a single token that is wider than the line (URLs, keysmash, emote spam). */
  private split(ctx: CanvasRenderingContext2D, word: string, maxWidth: number, m: Metrics): string[] {
    if (this.width(ctx, 'word', word, m) <= maxWidth) return [word];
    const chars = Array.from(word);
    const out: string[] = [];
    let buf = '';
    for (const ch of chars) {
      const next = buf + ch;
      if (buf.length > 0 && this.width(ctx, 'word', next, m) > maxWidth) {
        out.push(buf);
        buf = ch;
      } else {
        buf = next;
      }
    }
    if (buf.length > 0) out.push(buf);
    return out;
  }

  private paint(
    ctx: CanvasRenderingContext2D,
    entry: Placed,
    boxX: number,
    top: number,
    boxW: number,
    indent: number,
    m: Metrics,
  ): void {
    const alpha = entry.alpha;
    if (alpha <= 0.001) return;

    ctx.globalAlpha = alpha * this.cfg.backgroundOpacity;
    ctx.fillStyle = this.cfg.backgroundColor;
    roundedPath(ctx, boxX, top, boxW, entry.height, m.radius);
    ctx.fill();

    const textLeft = boxX + m.pad + indent;
    let baseline = top + m.pad + m.font;

    if (this.cfg.showAvatars) {
      const size = m.avatar;
      const cx = boxX + m.pad + size / 2;
      const cy = top + m.pad + size / 2;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = entry.msg.authorColor;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.fill();
      const initial = (Array.from(entry.msg.author.trim())[0] ?? '?').toUpperCase();
      ctx.font = `700 ${Math.round(size * 0.52)}px ${FONT_STACK}`;
      ctx.fillStyle = inkOn(entry.msg.authorColor);
      ctx.textAlign = 'center';
      ctx.fillText(initial, cx, cy + size * 0.19);
      ctx.textAlign = 'left';
    }

    for (const line of entry.lines) {
      for (let i = 0; i < line.tokens.length; i++) {
        const token = line.tokens[i];
        const x = textLeft + line.offsets[i];
        if (token.kind === 'badge') {
          const bh = Math.round(m.small * 1.55);
          const by = baseline - m.font * 0.78;
          ctx.globalAlpha = alpha * 0.95;
          ctx.fillStyle = token.color;
          roundedPath(ctx, x, by, token.w, bh, bh / 2);
          ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.font = this.font('badge', m);
          ctx.fillStyle = inkOn(token.color);
          ctx.fillText(token.text, x + m.small * 0.55, by + bh * 0.72);
          continue;
        }
        ctx.globalAlpha = alpha;
        ctx.font = this.font(token.kind, m);
        ctx.fillStyle = token.color;
        ctx.fillText(token.text, x, baseline);
      }
      baseline += m.line;
    }

    ctx.globalAlpha = 1;
  }
}
