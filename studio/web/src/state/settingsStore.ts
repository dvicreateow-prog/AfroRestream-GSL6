/**
 * settingsStore — persisted user preferences for the Studio app.
 *
 * Deliberately separate from the live studio store: nothing here is part of a
 * broadcast's runtime state, it is the durable "how do I want my gear set up"
 * layer that must survive a reload.
 *
 * Persistence layout mirrors the documented storage shape:
 *   - one root snapshot under `studio.settings`
 *   - every leaf additionally mirrored to its own `studio.settings.<name>` key
 *   - the six `studio.extraCameraSettings.*` keys kept in sync with the
 *     primary camera/audio values
 *
 * The persist layer is hand-rolled (no zustand/middleware dependency): load
 * once at module init, then a debounced save on every change. Every storage
 * touch is wrapped so private-mode / disabled-storage browsers degrade to an
 * in-memory store instead of throwing.
 */
import { create } from 'zustand';

/* ------------------------------------------------------------------ types */

export type ResolutionId =
  | '854x480'
  | '1280x720'
  | '1280x720@60'
  | '1920x1080'
  | 'auto';

export type BackgroundMode = 'none' | 'blur' | 'image' | 'color';

export type KeyColorId = 'auto' | 'green' | 'blue' | 'magenta' | 'custom';

export type LutFilterId =
  | 'ClassicFilm'
  | 'TealOrange'
  | 'WarmCinema'
  | 'IcyDrama'
  | 'FadedMemories';

export type StreamProfileId =
  | '480p30'
  | '720p30'
  | '720p60'
  | '1080p30'
  | '1080p60';

export interface VideoSettings {
  cameraDeviceId: string | null;
  resolution: ResolutionId;
  /** Shipped default is ON — the preview reads as a mirror, like a webcam app. */
  isMirrored: boolean;
  beautifyEnabled: boolean;
  /** 0.2 - 0.6 in steps of 0.1. */
  beautifyIntensity: number;
}

export interface AudioSettings {
  micDeviceId: string | null;
  speakerDeviceId: string | null;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  stereo: boolean;
  highRes: boolean;
}

export interface BackgroundSettings {
  mode: BackgroundMode;
  imageId: string | null;
  color: string;
  lutFilter: LutFilterId | null;
}

export interface GreenScreenSettings {
  enabled: boolean;
  keyColor: KeyColorId;
  customColor: string;
  similarity: number;
  smoothness: number;
  spill: number;
}

export interface StreamSettings {
  profile: StreamProfileId;
  recordEveryBroadcast: boolean;
  lowLatency: boolean;
}

export interface UiSettings {
  lastPanel: string | null;
  panelOpen: boolean;
  autoOpenNotes: boolean;
}

export interface Settings {
  video: VideoSettings;
  audio: AudioSettings;
  background: BackgroundSettings;
  greenScreen: GreenScreenSettings;
  stream: StreamSettings;
  ui: UiSettings;
}

export type SettingsSection = keyof Settings;

export interface SettingsStore extends Settings {
  setVideo: (patch: Partial<VideoSettings>) => void;
  setAudio: (patch: Partial<AudioSettings>) => void;
  setBackground: (patch: Partial<BackgroundSettings>) => void;
  setGreenScreen: (patch: Partial<GreenScreenSettings>) => void;
  setStream: (patch: Partial<StreamSettings>) => void;
  setUi: (patch: Partial<UiSettings>) => void;
  resetAll: () => void;
}

/* --------------------------------------------------------------- defaults */

export const DEFAULTS: Settings = {
  video: {
    cameraDeviceId: null,
    resolution: 'auto',
    isMirrored: true,
    beautifyEnabled: false,
    beautifyIntensity: 0.3,
  },
  audio: {
    micDeviceId: null,
    speakerDeviceId: null,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    stereo: false,
    highRes: false,
  },
  background: {
    mode: 'none',
    imageId: null,
    color: '#101828',
    lutFilter: null,
  },
  greenScreen: {
    enabled: false,
    keyColor: 'auto',
    customColor: '#00ff00',
    similarity: 0.4,
    smoothness: 0.08,
    spill: 0.1,
  },
  stream: {
    profile: '1080p30',
    recordEveryBroadcast: false,
    lowLatency: false,
  },
  ui: {
    lastPanel: null,
    panelOpen: true,
    autoOpenNotes: false,
  },
};

/* ------------------------------------------------------------ option sets */

export const RESOLUTIONS: readonly ResolutionId[] = [
  '854x480',
  '1280x720',
  '1280x720@60',
  '1920x1080',
  'auto',
];

export const BACKGROUND_MODES: readonly BackgroundMode[] = [
  'none',
  'blur',
  'image',
  'color',
];

export const KEY_COLORS: readonly KeyColorId[] = [
  'auto',
  'green',
  'blue',
  'magenta',
  'custom',
];

export const LUT_FILTERS: readonly LutFilterId[] = [
  'ClassicFilm',
  'TealOrange',
  'WarmCinema',
  'IcyDrama',
  'FadedMemories',
];

export const STREAM_PROFILES: readonly StreamProfileId[] = [
  '480p30',
  '720p30',
  '720p60',
  '1080p30',
  '1080p60',
];

export const BEAUTIFY_MIN = 0.2;
export const BEAUTIFY_MAX = 0.6;
export const BEAUTIFY_STEP = 0.1;

/* ----------------------------------------------------------- storage keys */

export const SETTINGS_ROOT_KEY = 'studio.settings';
const SAVE_DEBOUNCE_MS = 150;

type LeafKeyMap<T> = { readonly [K in keyof T]: string };

/** Individual leaf keys, matching the documented `studio.settings.*` layout. */
export const SETTINGS_KEY_MAP: {
  readonly video: LeafKeyMap<VideoSettings>;
  readonly audio: LeafKeyMap<AudioSettings>;
  readonly background: LeafKeyMap<BackgroundSettings>;
  readonly greenScreen: LeafKeyMap<GreenScreenSettings>;
  readonly stream: LeafKeyMap<StreamSettings>;
  readonly ui: LeafKeyMap<UiSettings>;
} = {
  video: {
    cameraDeviceId: 'studio.settings.videoInputDeviceId',
    resolution: 'studio.settings.profileVideoResolution',
    isMirrored: 'studio.settings.webcam.isMirrored',
    beautifyEnabled: 'studio.settings.isBeautifyFilterEnabled',
    beautifyIntensity: 'studio.settings.beautifyFilterIntensity',
  },
  audio: {
    micDeviceId: 'studio.settings.audioInputDeviceId',
    speakerDeviceId: 'studio.settings.audioOutputDeviceId',
    echoCancellation: 'studio.settings.shouldUseEchoCancellation',
    noiseSuppression: 'studio.settings.shouldUseNoiseSuppression',
    autoGainControl: 'studio.settings.shouldUseAutoGainControl',
    stereo: 'studio.settings.shouldUseStereoAudioInput',
    highRes: 'studio.settings.shouldUseHighResolutionAudio',
  },
  background: {
    mode: 'studio.settings.virtualBackgroundMode',
    imageId: 'studio.settings.virtualBackgroundIdV2',
    color: 'studio.settings.virtualBackgroundColor',
    lutFilter: 'studio.settings.lutFilter',
  },
  greenScreen: {
    enabled: 'studio.settings.greenScreenEnabled',
    keyColor: 'studio.settings.greenScreenKeyColorTypeV2',
    customColor: 'studio.settings.greenScreenCustomKeyColor',
    similarity: 'studio.settings.greenScreenSimilarity',
    smoothness: 'studio.settings.greenScreenSmoothness',
    spill: 'studio.settings.greenScreenSpill',
  },
  stream: {
    profile: 'studio.settings.streamingProfile',
    recordEveryBroadcast: 'studio.settings.shouldRecordEveryBroadcast',
    lowLatency: 'studio.settings.shouldUseLowLatency',
  },
  ui: {
    lastPanel: 'studio.settings.lastPanel',
    panelOpen: 'studio.settings.isPanelOpen',
    autoOpenNotes: 'studio.settings.shouldAutoOpenNotes',
  },
};

/** The six extra-camera keys kept in lockstep with the primary device. */
export const EXTRA_CAMERA_KEYS = {
  isMirrored: 'studio.extraCameraSettings.webcam.isMirrored',
  echoCancellation: 'studio.extraCameraSettings.shouldUseEchoCancellation',
  noiseSuppression: 'studio.extraCameraSettings.shouldUseNoiseSuppression',
  autoGainControl: 'studio.extraCameraSettings.shouldUseAutoGainControl',
  stereo: 'studio.extraCameraSettings.shouldUseStereoAudioInput',
  highRes: 'studio.extraCameraSettings.shouldUseHighResolutionAudio',
} as const;

/**
 * Every documented leaf key, including the ones this store does not model yet
 * (VP9, green-screen colour grading, webcam mute flags). Kept complete so a
 * reset really does clear the namespace.
 */
export const ALL_SETTINGS_KEYS: readonly string[] = [
  'studio.settings.audioInputDeviceId',
  'studio.settings.audioOutputDeviceId',
  'studio.settings.beautifyFilterIntensity',
  'studio.settings.greenScreenBrightness',
  'studio.settings.greenScreenContrast',
  'studio.settings.greenScreenCustomKeyColor',
  'studio.settings.greenScreenGamma',
  'studio.settings.greenScreenKeyColorTypeV2',
  'studio.settings.greenScreenSimilarity',
  'studio.settings.greenScreenSmoothness',
  'studio.settings.greenScreenSpill',
  'studio.settings.isBeautifyFilterEnabled',
  'studio.settings.lutFilter',
  'studio.settings.profileVideoResolution',
  'studio.settings.shouldShowGreenScreenConfirm',
  'studio.settings.shouldUseAutoGainControl',
  'studio.settings.shouldUseEchoCancellation',
  'studio.settings.shouldUseHighResolutionAudio',
  'studio.settings.shouldUseNoiseSuppression',
  'studio.settings.shouldUseStereoAudioInput',
  'studio.settings.shouldUseVp9',
  'studio.settings.videoInputDeviceId',
  'studio.settings.virtualBackgroundId',
  'studio.settings.virtualBackgroundIdV2',
  'studio.settings.webcam.isBlinded',
  'studio.settings.webcam.isMirrored',
  'studio.settings.webcam.isMuted',
  'studio.settings.greenScreenEnabled',
  'studio.settings.virtualBackgroundMode',
  'studio.settings.virtualBackgroundColor',
  'studio.settings.streamingProfile',
  'studio.settings.shouldRecordEveryBroadcast',
  'studio.settings.shouldUseLowLatency',
  'studio.settings.lastPanel',
  'studio.settings.isPanelOpen',
  'studio.settings.shouldAutoOpenNotes',
];

/* --------------------------------------------------------- storage access */

let storageChecked = false;
let storageRef: Storage | null = null;

/** Returns a usable Storage, or null when the browser refuses one. */
function storage(): Storage | null {
  if (storageChecked) return storageRef;
  storageChecked = true;
  try {
    const candidate = window.localStorage;
    const probe = '__studio.settings.probe__';
    candidate.setItem(probe, '1');
    candidate.removeItem(probe);
    storageRef = candidate;
  } catch {
    storageRef = null;
  }
  return storageRef;
}

function readKey(store: Storage, key: string): unknown {
  let text: string | null = null;
  try {
    text = store.getItem(key);
  } catch {
    return undefined;
  }
  if (text === null) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // Older builds wrote bare strings — take them at face value.
    return text;
  }
}

function writeKey(store: Storage, key: string, value: unknown): void {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled storage — in-memory state is still correct */
  }
}

function removeKey(store: Storage, key: string): void {
  try {
    store.removeItem(key);
  } catch {
    /* nothing to do */
  }
}

/* ------------------------------------------------------------ sanitizers */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNum(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function asText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function asTextOrNull(value: unknown, fallback: string | null): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value.length > 0 ? value : null;
  return fallback;
}

function asOption<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof value !== 'string') return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function asOptionOrNull<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T | null,
): T | null {
  if (value === null) return null;
  if (typeof value !== 'string') return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Clamp to the documented range and snap to the 0.1 slider step. */
function snapIntensity(value: unknown): number {
  const raw = asNum(value, DEFAULTS.video.beautifyIntensity, BEAUTIFY_MIN, BEAUTIFY_MAX);
  const steps = Math.round((raw - BEAUTIFY_MIN) / BEAUTIFY_STEP);
  const snapped = BEAUTIFY_MIN + steps * BEAUTIFY_STEP;
  const bounded = Math.min(BEAUTIFY_MAX, Math.max(BEAUTIFY_MIN, snapped));
  return Math.round(bounded * 100) / 100;
}

function asHex(value: unknown, fallback: string): string {
  const text = asText(value, fallback);
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text.toLowerCase() : fallback;
}

/* ----------------------------------------------------------- normalizers */

function normalizeVideo(raw: unknown): VideoSettings {
  const d = DEFAULTS.video;
  if (!isRecord(raw)) return { ...d };
  return {
    cameraDeviceId: asTextOrNull(raw.cameraDeviceId, d.cameraDeviceId),
    resolution: asOption(raw.resolution, RESOLUTIONS, d.resolution),
    isMirrored: asBool(raw.isMirrored, d.isMirrored),
    beautifyEnabled: asBool(raw.beautifyEnabled, d.beautifyEnabled),
    beautifyIntensity: snapIntensity(raw.beautifyIntensity),
  };
}

function normalizeAudio(raw: unknown): AudioSettings {
  const d = DEFAULTS.audio;
  if (!isRecord(raw)) return { ...d };
  return {
    micDeviceId: asTextOrNull(raw.micDeviceId, d.micDeviceId),
    speakerDeviceId: asTextOrNull(raw.speakerDeviceId, d.speakerDeviceId),
    echoCancellation: asBool(raw.echoCancellation, d.echoCancellation),
    noiseSuppression: asBool(raw.noiseSuppression, d.noiseSuppression),
    autoGainControl: asBool(raw.autoGainControl, d.autoGainControl),
    stereo: asBool(raw.stereo, d.stereo),
    highRes: asBool(raw.highRes, d.highRes),
  };
}

function normalizeBackground(raw: unknown): BackgroundSettings {
  const d = DEFAULTS.background;
  if (!isRecord(raw)) return { ...d };
  return {
    mode: asOption(raw.mode, BACKGROUND_MODES, d.mode),
    imageId: asTextOrNull(raw.imageId, d.imageId),
    color: asHex(raw.color, d.color),
    lutFilter: asOptionOrNull(raw.lutFilter, LUT_FILTERS, d.lutFilter),
  };
}

function normalizeGreenScreen(raw: unknown): GreenScreenSettings {
  const d = DEFAULTS.greenScreen;
  if (!isRecord(raw)) return { ...d };
  return {
    enabled: asBool(raw.enabled, d.enabled),
    keyColor: asOption(raw.keyColor, KEY_COLORS, d.keyColor),
    customColor: asHex(raw.customColor, d.customColor),
    similarity: asNum(raw.similarity, d.similarity, 0, 1),
    smoothness: asNum(raw.smoothness, d.smoothness, 0, 1),
    spill: asNum(raw.spill, d.spill, 0, 1),
  };
}

function normalizeStream(raw: unknown): StreamSettings {
  const d = DEFAULTS.stream;
  if (!isRecord(raw)) return { ...d };
  return {
    profile: asOption(raw.profile, STREAM_PROFILES, d.profile),
    recordEveryBroadcast: asBool(raw.recordEveryBroadcast, d.recordEveryBroadcast),
    lowLatency: asBool(raw.lowLatency, d.lowLatency),
  };
}

function normalizeUi(raw: unknown): UiSettings {
  const d = DEFAULTS.ui;
  if (!isRecord(raw)) return { ...d };
  return {
    lastPanel: asTextOrNull(raw.lastPanel, d.lastPanel),
    panelOpen: asBool(raw.panelOpen, d.panelOpen),
    autoOpenNotes: asBool(raw.autoOpenNotes, d.autoOpenNotes),
  };
}

/* -------------------------------------------------------------- hydration */

/**
 * Builds one section's raw values: the root snapshot wins, and any leaf the
 * snapshot is missing is recovered from its individual documented key.
 */
function collectSection(
  rootSection: unknown,
  keys: Record<string, string>,
  store: Storage | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = isRecord(rootSection) ? { ...rootSection } : {};
  if (store === null) return out;
  for (const name of Object.keys(keys)) {
    if (name in out) continue;
    const key = keys[name];
    if (key === undefined) continue;
    const value = readKey(store, key);
    if (value !== undefined) out[name] = value;
  }
  return out;
}

function hydrate(): Settings {
  const store = storage();
  const root: unknown = store === null ? null : readKey(store, SETTINGS_ROOT_KEY);
  const source: Record<string, unknown> = isRecord(root) ? root : {};
  const map = SETTINGS_KEY_MAP;
  return {
    video: normalizeVideo(
      collectSection(source.video, map.video as Record<string, string>, store),
    ),
    audio: normalizeAudio(
      collectSection(source.audio, map.audio as Record<string, string>, store),
    ),
    background: normalizeBackground(
      collectSection(source.background, map.background as Record<string, string>, store),
    ),
    greenScreen: normalizeGreenScreen(
      collectSection(
        source.greenScreen,
        map.greenScreen as Record<string, string>,
        store,
      ),
    ),
    stream: normalizeStream(
      collectSection(source.stream, map.stream as Record<string, string>, store),
    ),
    ui: normalizeUi(collectSection(source.ui, map.ui as Record<string, string>, store)),
  };
}

/* ------------------------------------------------------------ persistence */

function snapshot(state: Settings): Settings {
  return {
    video: { ...state.video },
    audio: { ...state.audio },
    background: { ...state.background },
    greenScreen: { ...state.greenScreen },
    stream: { ...state.stream },
    ui: { ...state.ui },
  };
}

function writeSection(
  store: Storage,
  values: Record<string, unknown>,
  keys: Record<string, string>,
): void {
  for (const [name, value] of Object.entries(values)) {
    const key = keys[name];
    if (key === undefined) continue;
    writeKey(store, key, value);
  }
}

function persist(state: Settings): void {
  const store = storage();
  if (store === null) return;
  writeKey(store, SETTINGS_ROOT_KEY, state);

  const map = SETTINGS_KEY_MAP;
  const flat = (section: object): Record<string, unknown> =>
    section as Record<string, unknown>;
  writeSection(store, flat(state.video), map.video as Record<string, string>);
  writeSection(store, flat(state.audio), map.audio as Record<string, string>);
  writeSection(store, flat(state.background), map.background as Record<string, string>);
  writeSection(store, flat(state.greenScreen), map.greenScreen as Record<string, string>);
  writeSection(store, flat(state.stream), map.stream as Record<string, string>);
  writeSection(store, flat(state.ui), map.ui as Record<string, string>);

  writeKey(store, EXTRA_CAMERA_KEYS.isMirrored, state.video.isMirrored);
  writeKey(store, EXTRA_CAMERA_KEYS.echoCancellation, state.audio.echoCancellation);
  writeKey(store, EXTRA_CAMERA_KEYS.noiseSuppression, state.audio.noiseSuppression);
  writeKey(store, EXTRA_CAMERA_KEYS.autoGainControl, state.audio.autoGainControl);
  writeKey(store, EXTRA_CAMERA_KEYS.stereo, state.audio.stereo);
  writeKey(store, EXTRA_CAMERA_KEYS.highRes, state.audio.highRes);
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pending: Settings | null = null;

function scheduleSave(state: Settings): void {
  pending = state;
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const next = pending;
    pending = null;
    if (next !== null) persist(next);
  }, SAVE_DEBOUNCE_MS);
}

/** Force any debounced write out immediately (used on page hide). */
export function flushSettings(): void {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const next = pending;
  pending = null;
  if (next !== null) persist(next);
}

function clearStoredSettings(): void {
  const store = storage();
  if (store === null) return;
  removeKey(store, SETTINGS_ROOT_KEY);
  for (const key of ALL_SETTINGS_KEYS) removeKey(store, key);
  for (const key of Object.values(EXTRA_CAMERA_KEYS)) removeKey(store, key);
}

/* ------------------------------------------------------------------ store */

export const useSettings = create<SettingsStore>()((set) => ({
  ...hydrate(),

  setVideo: (patch: Partial<VideoSettings>) =>
    set((state: SettingsStore) => ({
      video: normalizeVideo({ ...state.video, ...patch }),
    })),

  setAudio: (patch: Partial<AudioSettings>) =>
    set((state: SettingsStore) => ({
      audio: normalizeAudio({ ...state.audio, ...patch }),
    })),

  setBackground: (patch: Partial<BackgroundSettings>) =>
    set((state: SettingsStore) => ({
      background: normalizeBackground({ ...state.background, ...patch }),
    })),

  setGreenScreen: (patch: Partial<GreenScreenSettings>) =>
    set((state: SettingsStore) => ({
      greenScreen: normalizeGreenScreen({ ...state.greenScreen, ...patch }),
    })),

  setStream: (patch: Partial<StreamSettings>) =>
    set((state: SettingsStore) => ({
      stream: normalizeStream({ ...state.stream, ...patch }),
    })),

  setUi: (patch: Partial<UiSettings>) =>
    set((state: SettingsStore) => ({ ui: normalizeUi({ ...state.ui, ...patch }) })),

  resetAll: () => {
    clearStoredSettings();
    set(snapshot(DEFAULTS));
  },
}));

useSettings.subscribe((state: SettingsStore) => {
  scheduleSave(snapshot(state));
});

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushSettings);
}

/* -------------------------------------------------------------- selectors */

export const useVideoSettings = (): VideoSettings =>
  useSettings((s: SettingsStore) => s.video);
export const useAudioSettings = (): AudioSettings =>
  useSettings((s: SettingsStore) => s.audio);
export const useBackgroundSettings = (): BackgroundSettings =>
  useSettings((s: SettingsStore) => s.background);
export const useGreenScreenSettings = (): GreenScreenSettings =>
  useSettings((s: SettingsStore) => s.greenScreen);
export const useStreamSettings = (): StreamSettings =>
  useSettings((s: SettingsStore) => s.stream);
export const useUiSettings = (): UiSettings => useSettings((s: SettingsStore) => s.ui);
