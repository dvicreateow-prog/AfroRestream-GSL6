/*
 * Central studio state.
 *
 * Modelled on the entity graph recovered in studio/spec/SPEC-features-layouts.md and
 * TOOLS-08-sources-guests-media.md: a room holds participants; scenes hold source
 * placements; a layout arranges the active sources on a fixed 1920x1080 canvas.
 */
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { LayoutId, Participant, SceneKind } from '@studio/shared'

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export type SourceKind =
  | 'camera'
  | 'screen'
  | 'video'
  | 'image'
  | 'presentation'
  | 'countdown'
  | 'browser'
  | 'rtmp'
  | 'participant'

export interface Source {
  id: string
  kind: SourceKind
  name: string
  subtitle: string
  /** Live on the programme output. */
  onAir: boolean
  color: string
  /** Participant id when kind === 'participant'. */
  participantId?: string
  /** Object URL or remote URL for media sources. */
  url?: string
  /** Presentation slide position. */
  slide?: number
  slideCount?: number
  /** Media playback. */
  playing?: boolean
  loop?: boolean
  volume?: number
  /** Advance to the next scene when playback ends. */
  advanceOnEnd?: boolean
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

export interface Scene {
  id: string
  index: number
  kind: SceneKind
  title: string
  subtitle: string
  color: string
  layout: LayoutId
  /** Sources placed in this scene, in stage order. */
  sourceIds: string[]
  /** Per-scene QR code assignment - see TOOLS-06. */
  qrId?: string
}

/* ------------------------------------------------------------------ */
/* Overlays                                                            */
/* ------------------------------------------------------------------ */

export type OverlayKind =
  | 'banner'
  | 'lowerThird'
  | 'ticker'
  | 'logo'
  | 'background'
  | 'caption'
  | 'qr'
  | 'chat'
  | 'countdown'

export interface Overlay {
  id: string
  kind: OverlayKind
  /** Display label shown in the Graphics panel list. */
  name: string
  visible: boolean
  /** Stage rect in percent of the canvas (0-100). */
  x: number
  y: number
  w: number
  h: number
  text?: string
  subtext?: string
  color?: string
  url?: string
  /**
   * Scene this overlay belongs to. Undefined means "every scene", which keeps
   * anything created before scene-scoping existed visible. Without this a lower
   * third added on one scene stayed burned into all the others.
   */
  sceneId?: string
}

/* ------------------------------------------------------------------ */
/* Panels                                                              */
/* ------------------------------------------------------------------ */

export type PanelId =
  | 'sources'
  | 'chat'
  | 'graphics'
  | 'theme'
  | 'captions'
  | 'qr'
  | 'notes'
  | 'ai'

export type ModalId =
  | null
  | 'settings'
  | 'addScene'
  | 'addMediaScene'
  | 'addSource'
  | 'invite'
  | 'streamDetails'
  | 'channels'
  | 'customizeLayout'

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

const ACCENTS = ['#2864f0', '#7c5cfc', '#ef4b55', '#43c7e8', '#24c875', '#f4c84a']

let seq = 0
const uid = (p: string) => `${p}_${(++seq).toString(36)}${Date.now().toString(36).slice(-4)}`

interface StudioState {
  /* room */
  title: string
  live: boolean
  recording: boolean
  startedAt: number | null
  viewers: number

  /* devices */
  micOn: boolean
  camOn: boolean
  screenOn: boolean

  /* entities */
  scenes: Scene[]
  sources: Record<string, Source>
  overlays: Overlay[]
  participants: Participant[]

  /* ui */
  activeSceneId: string
  panel: PanelId
  panelOpen: boolean
  modal: ModalId
  editMode: boolean

  /* actions */
  setTitle: (t: string) => void
  toggleLive: () => void
  toggleRecording: () => void
  toggleMic: () => void
  toggleCam: () => void
  toggleScreen: () => void
  /* Device access is async and can fail, so the engine sets these explicitly
   * rather than the UI toggling optimistically. */
  setMic: (v: boolean) => void
  setCam: (v: boolean) => void
  setScreen: (v: boolean) => void
  setLive: (v: boolean) => void

  setPanel: (p: PanelId) => void
  closePanel: () => void
  openModal: (m: ModalId) => void
  closeModal: () => void
  setEditMode: (v: boolean) => void

  selectScene: (id: string) => void
  addScene: (kind: SceneKind, title: string, subtitle?: string) => void
  removeScene: (id: string) => void
  renameScene: (id: string, title: string) => void
  setLayout: (layout: LayoutId) => void

  addSource: (s: Omit<Source, 'id' | 'onAir' | 'color'> & Partial<Source>) => string
  toggleSource: (id: string) => void
  removeSource: (id: string) => void
  updateSource: (id: string, patch: Partial<Source>) => void

  /* Scene <-> capture binding. Engine captures are the real sources; a scene holds
   * the ids that are on stage for it, so switching scenes changes the composition. */
  bindCapture: (captureId: string, sceneId?: string) => void
  unbindCapture: (captureId: string, sceneId?: string) => void
  toggleCaptureOnScene: (captureId: string) => void
  /** Drop ids for captures that no longer exist, across every scene. */
  pruneCaptures: (existingIds: string[]) => void

  addOverlay: (o: Omit<Overlay, 'id'>) => string
  updateOverlay: (id: string, patch: Partial<Overlay>) => void
  toggleOverlay: (id: string) => void
  removeOverlay: (id: string) => void

  setParticipants: (p: Participant[]) => void
}

/* Seed matching the captured studio window, so the shell renders meaningfully
 * before any device or room is connected. */
function seed() {
  const scenes: Scene[] = [
    { id: 'sc1', index: 1, kind: 'camera', title: 'Camera', subtitle: 'Host + guest', color: ACCENTS[0], layout: 'split', sourceIds: [] },
    { id: 'sc2', index: 2, kind: 'presentation', title: 'Presentation', subtitle: 'Q3 roadmap', color: ACCENTS[1], layout: 'spotlight', sourceIds: [] },
    { id: 'sc3', index: 3, kind: 'countdown', title: 'Countdown', subtitle: 'Starting soon', color: ACCENTS[2], layout: 'solo', sourceIds: [] },
    { id: 'sc4', index: 4, kind: 'video', title: 'Video', subtitle: 'Product demo', color: ACCENTS[3], layout: 'solo', sourceIds: [] },
    { id: 'sc5', index: 5, kind: 'camera', title: 'Q&A', subtitle: 'Three speakers', color: ACCENTS[4], layout: 'grid', sourceIds: [] },
  ]
  return { scenes }
}

export const useStudio = create<StudioState>((set, get) => {
  const { scenes } = seed()

  return {
    title: 'Weekly Product Update',
    live: false,
    recording: false,
    startedAt: null,
    viewers: 0,

    micOn: false,
    camOn: false,
    screenOn: false,

    scenes,
    sources: {},
    overlays: [],
    participants: [],

    activeSceneId: scenes[0].id,
    panel: 'sources',
    panelOpen: true,
    modal: null,
    editMode: false,

    setTitle: (title) => set({ title }),

    toggleLive: () =>
      set((s) =>
        s.live
          ? { live: false, startedAt: null, viewers: 0 }
          : { live: true, startedAt: Date.now() },
      ),

    toggleRecording: () => set((s) => ({ recording: !s.recording })),
    toggleMic: () => set((s) => ({ micOn: !s.micOn })),
    toggleCam: () => set((s) => ({ camOn: !s.camOn })),
    toggleScreen: () => set((s) => ({ screenOn: !s.screenOn })),

    setMic: (micOn) => set({ micOn }),
    setCam: (camOn) => set({ camOn }),
    setScreen: (screenOn) => set({ screenOn }),
    setLive: (live) =>
      set((s) =>
        live
          ? { live: true, startedAt: s.startedAt ?? Date.now() }
          : { live: false, startedAt: null, viewers: 0 },
      ),

    /* Clicking the active tool closes the panel, matching Studio's behaviour. */
    setPanel: (panel) =>
      set((s) =>
        s.panel === panel && s.panelOpen
          ? { panelOpen: false }
          : { panel, panelOpen: true },
      ),

    closePanel: () => set({ panelOpen: false }),
    openModal: (modal) => set({ modal }),
    closeModal: () => set({ modal: null }),
    setEditMode: (editMode) => set({ editMode }),

    selectScene: (activeSceneId) => set({ activeSceneId }),

    addScene: (kind, title, subtitle = '') =>
      set((s) => {
        const index = s.scenes.length + 1
        const scene: Scene = {
          id: uid('sc'),
          index,
          kind,
          title,
          subtitle,
          color: ACCENTS[(index - 1) % ACCENTS.length],
          layout: 'solo',
          sourceIds: [],
        }
        return { scenes: [...s.scenes, scene], activeSceneId: scene.id }
      }),

    removeScene: (id) =>
      set((s) => {
        if (s.scenes.length <= 1) return s
        const scenes = s.scenes
          .filter((x) => x.id !== id)
          .map((x, i) => ({ ...x, index: i + 1 }))
        return {
          scenes,
          activeSceneId: s.activeSceneId === id ? scenes[0].id : s.activeSceneId,
        }
      }),

    renameScene: (id, title) =>
      set((s) => ({ scenes: s.scenes.map((x) => (x.id === id ? { ...x, title } : x)) })),

    setLayout: (layout) =>
      set((s) => ({
        scenes: s.scenes.map((x) => (x.id === s.activeSceneId ? { ...x, layout } : x)),
      })),

    addSource: (input) => {
      const id = uid('src')
      const source: Source = {
        ...input,
        id,
        kind: input.kind,
        name: input.name,
        subtitle: input.subtitle ?? '',
        onAir: input.onAir ?? false,
        color: input.color ?? ACCENTS[Object.keys(get().sources).length % ACCENTS.length],
      }
      set((s) => ({
        sources: { ...s.sources, [id]: source },
        scenes: s.scenes.map((x) =>
          x.id === s.activeSceneId ? { ...x, sourceIds: [...x.sourceIds, id] } : x,
        ),
      }))
      return id
    },

    toggleSource: (id) =>
      set((s) => {
        const src = s.sources[id]
        if (!src) return s
        return { sources: { ...s.sources, [id]: { ...src, onAir: !src.onAir } } }
      }),

    updateSource: (id, patch) =>
      set((s) => {
        const src = s.sources[id]
        if (!src) return s
        return { sources: { ...s.sources, [id]: { ...src, ...patch } } }
      }),

    removeSource: (id) =>
      set((s) => {
        const sources = { ...s.sources }
        delete sources[id]
        return {
          sources,
          scenes: s.scenes.map((x) => ({
            ...x,
            sourceIds: x.sourceIds.filter((sid) => sid !== id),
          })),
        }
      }),

    bindCapture: (captureId, sceneId) =>
      set((s) => {
        const target = sceneId ?? s.activeSceneId
        return {
          scenes: s.scenes.map((x) =>
            x.id === target && !x.sourceIds.includes(captureId)
              ? { ...x, sourceIds: [...x.sourceIds, captureId] }
              : x,
          ),
        }
      }),

    unbindCapture: (captureId, sceneId) =>
      set((s) => {
        const target = sceneId ?? s.activeSceneId
        return {
          scenes: s.scenes.map((x) =>
            x.id === target
              ? { ...x, sourceIds: x.sourceIds.filter((id) => id !== captureId) }
              : x,
          ),
        }
      }),

    toggleCaptureOnScene: (captureId) =>
      set((s) => ({
        scenes: s.scenes.map((x) =>
          x.id === s.activeSceneId
            ? {
                ...x,
                sourceIds: x.sourceIds.includes(captureId)
                  ? x.sourceIds.filter((id) => id !== captureId)
                  : [...x.sourceIds, captureId],
              }
            : x,
        ),
      })),

    pruneCaptures: (existingIds) =>
      set((s) => {
        const live = new Set(existingIds)
        let changed = false
        const scenes = s.scenes.map((x) => {
          const kept = x.sourceIds.filter((id) => live.has(id))
          if (kept.length === x.sourceIds.length) return x
          changed = true
          return { ...x, sourceIds: kept }
        })
        /* Returning the same array keeps subscribers from re-rendering. */
        return changed ? { scenes } : s
      }),

    addOverlay: (o) => {
      const id = uid('ov')
      /* Bind to the scene being edited, the same way bindCapture does for sources,
       * unless the caller has named a scene itself. */
      set((s) => ({ overlays: [...s.overlays, { sceneId: s.activeSceneId, ...o, id }] }))
      return id
    },

    updateOverlay: (id, patch) =>
      set((s) => ({
        overlays: s.overlays.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      })),

    toggleOverlay: (id) =>
      set((s) => ({
        overlays: s.overlays.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o)),
      })),

    removeOverlay: (id) =>
      set((s) => ({ overlays: s.overlays.filter((o) => o.id !== id) })),

    setParticipants: (participants) => set({ participants }),
  }
})

/* Derived selectors */
export const useActiveScene = () =>
  useStudio((s) => s.scenes.find((x) => x.id === s.activeSceneId) ?? s.scenes[0])

/* useShallow keeps the snapshot referentially stable - zustand v5 goes through
 * useSyncExternalStore, which re-renders forever if the selector allocates. */
export const useSceneSources = () =>
  useStudio(
    useShallow((s) => {
      const scene = s.scenes.find((x) => x.id === s.activeSceneId)
      if (!scene) return [] as Source[]
      return scene.sourceIds.map((id) => s.sources[id]).filter(Boolean)
    }),
  )
