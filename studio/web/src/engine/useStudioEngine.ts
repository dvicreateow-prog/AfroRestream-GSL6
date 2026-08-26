/*
 * Binds the media engine to studio state.
 *
 * The engine owns device streams; the store mirrors them so the Sources panel and
 * the stage stay in sync. Device toggles are async and can fail (permission denied,
 * device busy), so they surface a real error rather than flipping state optimistically.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { engine, type CaptureHandle } from './mediaEngine'
import { useActiveScene, useStudio } from '../state/studioStore'

/* Overlay kinds the compositor can paint today. */
type DrawableKind = 'lowerThird' | 'ticker' | 'logo' | 'caption' | 'qr' | 'banner'
const DRAWABLE = new Set<string>(['lowerThird', 'ticker', 'logo', 'caption', 'qr', 'banner'])

const KIND_COLOR: Record<string, string> = {
  camera: '#2864f0',
  screen: '#43c7e8',
  media: '#7c5cfc',
}

export function useStudioEngine() {
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const scene = useActiveScene()

  const [captures, setCaptures] = useState<CaptureHandle[]>([])
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const live = useStudio((s) => s.live)
  const setLive = useStudio((s) => s.setLive)
  const micOn = useStudio((s) => s.micOn)
  const overlays = useStudio((s) => s.overlays)
  const setMic = useStudio((s) => s.setMic)
  const setCam = useStudio((s) => s.setCam)
  const setScreen = useStudio((s) => s.setScreen)
  const bindCapture = useStudio((s) => s.bindCapture)
  const pruneCaptures = useStudio((s) => s.pruneCaptures)
  const sceneSourceIds = scene.sourceIds

  /* ---- mount the composited canvas ---- */
  useEffect(() => {
    const host = canvasHostRef.current
    if (host) engine.mount(host)
  }, [])

  /* ---- engine events ---- */
  useEffect(() => {
    const off = engine.on((e) => {
      if (e.t === 'captures') setCaptures(engine.captureList)
      else if (e.t === 'levels') setLevels(e.levels)
      else if (e.t === 'live') setLive(e.live)
      else if (e.t === 'error') setError(e.message)
    })
    /* engine.on returns Set.delete, which yields a boolean - swallow it. */
    return () => {
      off()
    }
  }, [setLive])

  /* Pick up any capture started before this hook mounted. */
  useEffect(() => {
    setCaptures(engine.captureList)
  }, [])

  /* ---- keep the compositor in step with the active scene ---- */
  useEffect(() => {
    engine.setLayout(scene.layout)
  }, [scene.layout])

  /* ---- draw the store's overlays ----
   * The compositor only knows how to paint a subset of overlay kinds; the rest
   * (background, chat, countdown) are composed elsewhere, so they are filtered out
   * rather than silently mis-drawn. */
  useEffect(() => {
    engine.setOverlays(
      overlays
        .filter((o): o is typeof o & { kind: DrawableKind } => DRAWABLE.has(o.kind))
        .map((o) => ({
          id: o.id,
          kind: o.kind,
          visible: o.visible,
          x: o.x,
          y: o.y,
          w: o.w,
          h: o.h,
          text: o.text ?? o.name,
          subtext: o.subtext,
          color: o.color,
        })),
    )
  }, [overlays])

  /* ---- newly started captures join the scene that is live right now ---- */
  const knownRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    const known = knownRef.current
    for (const c of captures) {
      if (!known.has(c.id)) {
        known.add(c.id)
        bindCapture(c.id)
      }
    }
    /* Drop ids for captures that have gone away, across every scene. */
    const liveIds = captures.map((c) => c.id)
    const liveSet = new Set(liveIds)
    for (const id of [...known]) if (!liveSet.has(id)) known.delete(id)
    pruneCaptures(liveIds)
  }, [captures, bindCapture, pruneCaptures])

  /* ---- cross-fade when the scene changes ----
   * Runs in its own effect declared BEFORE the tile swap, so the snapshot still
   * holds the outgoing scene when it is taken. */
  const prevSceneRef = useRef(scene.id)
  useEffect(() => {
    if (prevSceneRef.current !== scene.id) {
      prevSceneRef.current = scene.id
      engine.beginTransition('fade')
    }
  }, [scene.id])

  /* ---- only this scene's captures are composited ----
   * This is what makes scene switching change the programme output. */
  useEffect(() => {
    const byId = new Map(captures.map((c) => [c.id, c]))
    const colors: Record<string, string> = {}
    const onStage: string[] = []
    for (const id of sceneSourceIds) {
      const c = byId.get(id)
      if (!c) continue
      colors[id] = KIND_COLOR[c.kind] ?? '#2864f0'
      onStage.push(id)
    }
    engine.syncTiles(onStage, colors)
  }, [captures, sceneSourceIds, micOn])

  /* ---- device toggles ---- */

  const guard = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (e) {
      const msg = (e as Error).message || String(e)
      setError(
        /denied|NotAllowed/i.test(msg)
          ? 'Permission denied. Allow access in your browser, then try again.'
          : /NotFound|no device/i.test(msg)
            ? 'No matching device was found.'
            : /NotReadable|in use/i.test(msg)
              ? 'That device is already in use by another application.'
              : msg,
      )
    } finally {
      setBusy(false)
    }
  }, [])

  const toggleCamera = useCallback(
    () =>
      guard(async () => {
        if (engine.hasKind('camera')) {
          engine.stopKind('camera')
          setCam(false)
        } else {
          await engine.startCamera()
          setCam(true)
        }
      }),
    [guard, setCam],
  )

  const toggleScreen = useCallback(
    () =>
      guard(async () => {
        if (engine.hasKind('screen')) {
          engine.stopKind('screen')
          setScreen(false)
        } else {
          await engine.startScreen()
          setScreen(true)
        }
      }),
    [guard, setScreen],
  )

  const toggleMic = useCallback(
    () =>
      guard(async () => {
        if (engine.micActive) {
          engine.stopMic()
          setMic(false)
        } else {
          await engine.startMic()
          setMic(true)
        }
      }),
    [guard, setMic],
  )

  /** Put a local video or image file on stage. */
  const addMedia = useCallback(
    (file: File) =>
      guard(async () => {
        if (file.type.startsWith('video/')) await engine.addVideoFile(file)
        else if (file.type.startsWith('image/')) await engine.addImageFile(file)
        else throw new Error(`${file.name} is not a video or image file.`)
      }),
    [guard],
  )

  const mediaControl = useCallback(
    (id: string, action: 'play' | 'pause' | 'restart' | 'toggleLoop') =>
      engine.mediaControl(id, action),
    [],
  )

  const toggleLive = useCallback(
    () =>
      guard(async () => {
        if (engine.live) engine.stopLive()
        else await engine.goLive({ profile: '1080p30' })
      }),
    [guard],
  )

  return {
    canvasHostRef,
    captures,
    levels,
    error,
    busy,
    live,
    clearError: () => setError(''),
    toggleCamera,
    toggleScreen,
    toggleMic,
    toggleLive,
    addMedia,
    mediaControl,
    /** Capture ids composited on the current scene. */
    onStageIds: sceneSourceIds,
    stopCapture: (id: string) => engine.stopCapture(id),
  }
}
