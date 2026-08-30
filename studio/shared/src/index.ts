/* Shared contracts between the studio web client and the media/stream server. */

export type Role = 'host' | 'guest'
export type ParticipantState = 'backstage' | 'onstage'

export interface Participant {
  id: string
  name: string
  role: Role
  state: ParticipantState
  /** Host has approved this participant to enter the room. */
  approved: boolean
  micOn: boolean
  camOn: boolean
  screenOn: boolean
  /** Deterministic accent colour assigned on join. */
  color: string
  joinedAt: number
}

export interface RoomSnapshot {
  id: string
  title: string
  hostId: string | null
  participants: Participant[]
  live: boolean
  recording: boolean
  startedAt: number | null
  /** Guests must be approved by the host before entering. */
  requireApproval: boolean
  capacity: number
}

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

export type DestinationPlatform =
  | 'youtube'
  | 'twitch'
  | 'facebook'
  | 'linkedin'
  | 'x'
  | 'kick'
  | 'custom'

export interface Destination {
  id: string
  platform: DestinationPlatform
  name: string
  /** rtmp:// or rtmps:// ingest URL */
  url: string
  streamKey: string
  enabled: boolean
}

export type DestinationHealth = 'idle' | 'connecting' | 'live' | 'error'

export interface DestinationStatus {
  id: string
  health: DestinationHealth
  message?: string
  bitrateKbps?: number
}

export interface StreamStats {
  live: boolean
  recording: boolean
  startedAt: number | null
  /** Encoder output bitrate in kbps. */
  bitrateKbps: number
  fps: number
  droppedFrames: number
  destinations: DestinationStatus[]
}

/* ------------------------------------------------------------------ */
/* Signaling                                                           */
/* ------------------------------------------------------------------ */

export type ClientMessage =
  | { t: 'join'; roomId: string; name: string; role: Role; token?: string }
  | { t: 'leave' }
  | { t: 'signal'; to: string; data: unknown }
  | { t: 'setMedia'; micOn?: boolean; camOn?: boolean; screenOn?: boolean }
  | { t: 'admit'; participantId: string }
  | { t: 'deny'; participantId: string }
  | { t: 'setStage'; participantId: string; state: ParticipantState }
  | { t: 'removeParticipant'; participantId: string }
  | { t: 'setRoom'; title?: string; requireApproval?: boolean }
  | { t: 'chat'; text: string }
  | { t: 'ping' }

/** Mirrors RTCIceServer, redeclared so the Node server does not need DOM libs. */
export interface IceServer {
  urls: string | string[]
  username?: string
  credential?: string
}

export type ServerMessage =
  | { t: 'welcome'; selfId: string; room: RoomSnapshot; iceServers: IceServer[] }
  | { t: 'room'; room: RoomSnapshot }
  | { t: 'peerJoined'; participant: Participant }
  | { t: 'peerLeft'; participantId: string }
  | { t: 'signal'; from: string; data: unknown }
  | { t: 'waiting' }
  | { t: 'denied'; reason: string }
  | { t: 'chat'; message: ChatMessage }
  | { t: 'stream'; stats: StreamStats }
  | { t: 'error'; message: string }
  | { t: 'pong' }

export interface ChatMessage {
  id: string
  author: string
  authorColor: string
  text: string
  /** Which platform the message came from; 'studio' is the in-room chat. */
  source: 'studio' | DestinationPlatform
  at: number
  pinned?: boolean
  /** Currently rendered on the stream as a chat overlay. */
  onStream?: boolean
}

/* ------------------------------------------------------------------ */
/* Scenes / composition                                                */
/* ------------------------------------------------------------------ */

export type LayoutId =
  | 'solo'
  | 'split'
  | 'stacked'
  | 'grid'
  | 'pip'
  | 'spotlight'
  | 'screen'
  | 'custom'

export type SceneKind =
  | 'camera'
  | 'screen'
  | 'presentation'
  | 'video'
  | 'image'
  | 'countdown'
  | 'browser'
  | 'rtmp'

export const CANVAS_W = 1920
export const CANVAS_H = 1080

/* Restream's real scene/layout vocabulary, transcribed from the spec corpus.
 * See scene-layout-model.ts for the [O]/[I] marks and per-symbol sources. */
export * from './scene-layout-model'
