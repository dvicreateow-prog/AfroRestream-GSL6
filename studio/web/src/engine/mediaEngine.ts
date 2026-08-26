/*
 * Media engine.
 *
 * Owns every live MediaStream, feeds the compositor, mixes audio, and pushes the
 * programme feed to the server for RTMP fan-out.
 *
 * One instance per page. React binds to it through useMediaEngine; the engine itself
 * is framework-agnostic so it survives StrictMode's double-mount without tearing
 * down real device streams.
 */
import { Compositor, type OverlayDraw, type Tile } from './compositor'
import { AudioMixer } from './audioMixer'
import { CountdownRenderer, type CountdownConfig } from './countdownRenderer'
import {
  ChatOverlayRenderer,
  type ChatOverlayConfig,
  type ChatOverlayMessage,
} from './chatOverlayRenderer'
import { TransitionRunner, snapshot, type TransitionKind } from './transitions'
import { wsUrl } from '../lib/api'
import { getToken } from '../lib/session'
import type { LayoutId } from '@studio/shared'

export type CaptureKind = 'camera' | 'screen' | 'media'

export interface CaptureHandle {
  id: string
  kind: CaptureKind
  /** Mutable: a guest tile is named once the roster reports who they are. */
  label: string
  stream: MediaStream
  el: HTMLVideoElement
}

export type EngineEvent =
  | { t: 'captures' }
  | { t: 'live'; live: boolean }
  | { t: 'levels'; levels: Record<string, number> }
  | { t: 'stats'; stats: unknown }
  | { t: 'error'; message: string }

type Listener = (e: EngineEvent) => void

/** Attaches a stream to a hidden video element the compositor can draw. */
function makeVideoEl(stream: MediaStream): HTMLVideoElement {
  const el = document.createElement('video')
  el.srcObject = stream
  el.muted = true
  el.playsInline = true
  el.autoplay = true
  /* Kept out of the layout but still decoded. */
  el.style.position = 'fixed'
  el.style.opacity = '0'
  el.style.pointerEvents = 'none'
  el.style.width = '1px'
  el.style.height = '1px'
  el.style.left = '-10px'
  document.body.appendChild(el)
  void el.play().catch(() => {})
  return el
}

class MediaEngine {
  readonly compositor = new Compositor({ fps: 30, background: '#0c0c0c' })
  private mixer: AudioMixer | null = null
  private captures = new Map<string, CaptureHandle>()
  /** Blob URLs for local media, revoked when the capture is removed. */
  private objectUrls = new Map<string, string>()
  private listeners = new Set<Listener>()

  private recorder: MediaRecorder | null = null
  private socket: WebSocket | null = null
  private _live = false

  private micStream: MediaStream | null = null

  /* On-canvas widgets. Each is registered as a compositor painter only while it
   * has something to show, so an idle studio pays nothing per frame. */
  readonly countdown = new CountdownRenderer()
  readonly chatOverlay = new ChatOverlayRenderer()
  private transitions = new TransitionRunner('fade', 320)

  get live() {
    return this._live
  }

  get captureList(): CaptureHandle[] {
    return [...this.captures.values()]
  }

  /* ---------------- events ---------------- */

  on(fn: Listener) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit(e: EngineEvent) {
    for (const fn of this.listeners) fn(e)
  }

  /* ---------------- lifecycle ---------------- */

  start() {
    this.compositor.start()
  }

  /** Mount the compositor canvas into a container element. */
  mount(container: HTMLElement) {
    const c = this.compositor.canvas
    c.style.width = '100%'
    c.style.height = '100%'
    c.style.display = 'block'
    if (c.parentElement !== container) container.appendChild(c)
    this.compositor.start()
  }

  private ensureMixer(): AudioMixer {
    if (!this.mixer) {
      this.mixer = new AudioMixer()
      this.mixer.onLevelUpdate((levels) => this.emit({ t: 'levels', levels }))
    }
    return this.mixer
  }

  /* ---------------- capture ---------------- */

  async startCamera(deviceId?: string): Promise<CaptureHandle> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 },
    })
    const track = stream.getVideoTracks()[0]
    return this.addCapture('camera', track.label || 'Camera', stream)
  }

  async startScreen(): Promise<CaptureHandle> {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: true,
    })
    const handle = this.addCapture('screen', 'Screen share', stream)
    /* Screen share ends when the user hits the browser's own stop button. */
    stream.getVideoTracks()[0]?.addEventListener('ended', () => this.stopCapture(handle.id))
    if (stream.getAudioTracks().length) {
      await this.ensureMixer().addSource({
        id: handle.id,
        stream,
        gain: 1,
        muted: false,
        solo: false,
      })
    }
    return handle
  }

  /** Attach an already-created stream (a remote guest, a media clip). */
  addStream(kind: CaptureKind, label: string, stream: MediaStream): CaptureHandle {
    return this.addCapture(kind, label, stream)
  }

  /**
   * Put a local video file on stage. The element itself is the draw source, so no
   * captureStream is needed; its audio is routed through the mixer when present.
   */
  async addVideoFile(file: File, opts: { loop?: boolean } = {}): Promise<CaptureHandle> {
    const url = URL.createObjectURL(file)
    const el = document.createElement('video')
    el.src = url
    el.loop = opts.loop ?? false
    el.playsInline = true
    el.muted = false
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;left:-10px'
    document.body.appendChild(el)

    await new Promise<void>((resolve, reject) => {
      el.addEventListener('loadedmetadata', () => resolve(), { once: true })
      el.addEventListener('error', () => reject(new Error(`Could not read ${file.name}`)), { once: true })
    })
    await el.play().catch(() => {})

    const id = `cap_media_${Date.now().toString(36)}`
    const handle: CaptureHandle = {
      id,
      kind: 'media',
      label: file.name.replace(/\.[^.]+$/, ''),
      stream: new MediaStream(),
      el,
    }
    this.captures.set(id, handle)
    this.objectUrls.set(id, url)

    /* Route the clip's audio into the programme mix. */
    const captureable = el as HTMLVideoElement & { captureStream?: () => MediaStream }
    try {
      const s = captureable.captureStream?.()
      if (s && s.getAudioTracks().length) {
        await this.ensureMixer().addSource({
          id,
          stream: s,
          gain: 1,
          muted: false,
          solo: false,
        })
      }
    } catch {
      /* captureStream is unavailable on some browsers - video still draws */
    }

    this.emit({ t: 'captures' })
    return handle
  }

  /** Put a still image on stage. */
  async addImageFile(file: File): Promise<CaptureHandle> {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Could not read ${file.name}`))
    })

    const id = `cap_media_${Date.now().toString(36)}`
    const handle: CaptureHandle = {
      id,
      kind: 'media',
      label: file.name.replace(/\.[^.]+$/, ''),
      stream: new MediaStream(),
      /* The compositor accepts any drawable element; the cast keeps one handle type. */
      el: img as unknown as HTMLVideoElement,
    }
    this.captures.set(id, handle)
    this.objectUrls.set(id, url)
    this.emit({ t: 'captures' })
    return handle
  }

  /**
   * The host's own camera + mic, for publishing to guests over the mesh.
   *
   * Deliberately the raw camera rather than the composited programme: guests only
   * need to see the host, and sending the programme back into the room would put
   * their own tiles inside the frame they are watching.
   */
  hostPublishStream(): MediaStream | null {
    const camera = [...this.captures.values()].find((c) => c.kind === 'camera')
    const out = new MediaStream()
    const videoTrack = camera?.stream.getVideoTracks()[0]
    if (videoTrack) out.addTrack(videoTrack)
    const micTrack = this.micStream?.getAudioTracks()[0]
    if (micTrack) out.addTrack(micTrack)
    return out.getTracks().length ? out : null
  }

  /** Update a capture's on-screen label, e.g. once a guest's name arrives. */
  renameCapture(id: string, label: string) {
    const h = this.captures.get(id)
    if (!h || h.label === label) return
    h.label = label
    this.emit({ t: 'captures' })
  }

  /** Media playback controls for a clip already on stage. */
  mediaControl(id: string, action: 'play' | 'pause' | 'restart' | 'toggleLoop') {
    const el = this.captures.get(id)?.el
    if (!(el instanceof HTMLVideoElement)) return
    if (action === 'play') void el.play().catch(() => {})
    else if (action === 'pause') el.pause()
    else if (action === 'restart') {
      el.currentTime = 0
      void el.play().catch(() => {})
    } else el.loop = !el.loop
  }

  private addCapture(kind: CaptureKind, label: string, stream: MediaStream): CaptureHandle {
    const id = `cap_${kind}_${Date.now().toString(36)}`
    const handle: CaptureHandle = { id, kind, label, stream, el: makeVideoEl(stream) }
    this.captures.set(id, handle)
    this.emit({ t: 'captures' })
    return handle
  }

  stopCapture(id: string) {
    const h = this.captures.get(id)
    if (!h) return
    h.stream.getTracks().forEach((t) => t.stop())
    if (h.el instanceof HTMLVideoElement) {
      h.el.pause()
      h.el.srcObject = null
      h.el.removeAttribute('src')
      h.el.load()
    }
    h.el.remove()

    const url = this.objectUrls.get(id)
    if (url) {
      URL.revokeObjectURL(url)
      this.objectUrls.delete(id)
    }

    this.captures.delete(id)
    this.mixer?.removeSource(id)
    this.emit({ t: 'captures' })
  }

  stopKind(kind: CaptureKind) {
    for (const h of [...this.captures.values()]) {
      if (h.kind === kind) this.stopCapture(h.id)
    }
  }

  hasKind(kind: CaptureKind) {
    return [...this.captures.values()].some((h) => h.kind === kind)
  }

  /* ---------------- microphone ---------------- */

  async startMic(deviceId?: string) {
    if (this.micStream) return
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
    this.micStream = stream
    const mixer = this.ensureMixer()
    await mixer.resume()
    await mixer.addSource({ id: 'mic', stream, gain: 1, muted: false, solo: false })
  }

  stopMic() {
    this.micStream?.getTracks().forEach((t) => t.stop())
    this.micStream = null
    this.mixer?.removeSource('mic')
  }

  get micActive() {
    return this.micStream !== null
  }

  /* ---------------- composition ---------------- */

  setLayout(layout: LayoutId, primary = 0) {
    this.compositor.setLayout(layout, primary)
  }

  /* ---- countdown ---- */

  showCountdown(patch: Partial<CountdownConfig> = {}) {
    this.countdown.set(patch)
    this.compositor.setPainter('countdown', (ctx, w, h, now) =>
      this.countdown.draw(ctx, w, h, now),
    )
  }

  hideCountdown() {
    this.compositor.setPainter('countdown', null)
  }

  startCountdown(now = performance.now()) {
    this.countdown.start(now)
    this.showCountdown()
  }

  /* ---- chat on stream ---- */

  showChatOverlay(patch: Partial<ChatOverlayConfig> = {}) {
    this.chatOverlay.set(patch)
    this.compositor.setPainter('chat', (ctx, w, h, now) =>
      this.chatOverlay.draw(ctx, w, h, now),
    )
  }

  hideChatOverlay() {
    this.compositor.setPainter('chat', null)
  }

  pushChat(msg: ChatOverlayMessage) {
    this.chatOverlay.push(msg)
  }

  /* ---- scene transitions ---- */

  /**
   * Snapshot the current frame, then blend it over the incoming scene. Call this
   * BEFORE swapping tiles so the snapshot still shows the outgoing scene.
   */
  beginTransition(kind: TransitionKind = 'fade', durationMs?: number) {
    if (kind === 'cut') return
    const prev = snapshot(this.compositor.canvas)
    const now = performance.now()
    this.transitions.start(kind, now, durationMs)
    this.compositor.setTransition((ctx, w, h, t) =>
      this.transitions.paint(ctx, prev, w, h, t),
    )
  }

  setOverlays(overlays: OverlayDraw[]) {
    this.compositor.setOverlays(overlays)
  }

  /** Rebuild the compositor tile list from the captures the caller wants on air. */
  syncTiles(onAirIds: string[], colors: Record<string, string> = {}) {
    const tiles: Tile[] = []
    for (const id of onAirIds) {
      const h = this.captures.get(id)
      if (!h) continue
      tiles.push({
        id: h.id,
        el: h.el,
        label: h.label,
        color: colors[h.id],
        fit: h.kind === 'screen' ? 'contain' : 'cover',
        muted: h.kind === 'camera' && !this.micActive,
      })
    }
    this.compositor.setTiles(tiles)
  }

  /* ---------------- broadcast ---------------- */

  /** Mixed programme output: composited video + mixed audio. */
  programmeStream(): MediaStream {
    const video = this.compositor.captureStream()
    const out = new MediaStream(video.getVideoTracks())
    const audio = this.mixer?.stream.getAudioTracks() ?? []
    for (const t of audio) out.addTrack(t)
    return out
  }

  private pickMimeType(): string {
    const candidates = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
    ]
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c
    }
    return ''
  }

  async goLive(opts: { profile?: string; record?: boolean } = {}) {
    if (this._live) return

    const stream = this.programmeStream()
    if (stream.getVideoTracks().length === 0) {
      throw new Error('Nothing is on stage yet — add a source before going live.')
    }

    /* The ingest socket starts a broadcast, so the server requires a session.
     * Browsers cannot set headers on a WebSocket handshake, hence the query param. */
    const token = getToken()
    if (!token) {
      throw new Error('Sign in before going live.')
    }
    const socket = new WebSocket(
      `${wsUrl('/ws/ingest')}?access_token=${encodeURIComponent(token)}`,
    )
    socket.binaryType = 'arraybuffer'
    this.socket = socket

    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true })
      socket.addEventListener(
        'error',
        () =>
          reject(
            new Error(
              'Could not reach the stream server. Check it is running and that you are signed in.',
            ),
          ),
        { once: true },
      )
    })

    socket.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(String(ev.data))
        if (msg.t === 'stream') this.emit({ t: 'stats', stats: msg.stats })
        if (msg.t === 'error') this.emit({ t: 'error', message: msg.message })
      } catch {
        /* binary or malformed - ignore */
      }
    })

    socket.addEventListener('close', () => {
      if (this._live) this.stopLive()
    })

    socket.send(
      JSON.stringify({ t: 'start', profile: opts.profile ?? '1080p30', record: opts.record ?? false }),
    )

    const mimeType = this.pickMimeType()
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 6_000_000,
      audioBitsPerSecond: 160_000,
    })
    this.recorder = recorder

    recorder.ondataavailable = async (e) => {
      if (e.data.size === 0 || socket.readyState !== WebSocket.OPEN) return
      socket.send(await e.data.arrayBuffer())
    }
    recorder.onerror = () => this.emit({ t: 'error', message: 'The recorder stopped unexpectedly' })

    /* 200 ms slices keep latency low without flooding the socket. */
    recorder.start(200)

    this._live = true
    this.emit({ t: 'live', live: true })
  }

  stopLive() {
    if (!this._live && !this.recorder) return
    try {
      this.recorder?.stop()
    } catch {
      /* already stopped */
    }
    this.recorder = null

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ t: 'stop' }))
      this.socket.close()
    }
    this.socket = null

    this._live = false
    this.emit({ t: 'live', live: false })
  }

  /* ---------------- teardown ---------------- */

  dispose() {
    this.stopLive()
    for (const id of [...this.captures.keys()]) this.stopCapture(id)
    this.stopMic()
    this.mixer?.dispose()
    this.mixer = null
    this.compositor.dispose()
  }
}

/* Single shared instance - device streams must not be torn down by a re-render. */
export const engine = new MediaEngine()
