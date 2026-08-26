/*
 * Room registry and WebRTC signaling.
 *
 * Guests connect peer-to-peer to the host (mesh). The server only brokers SDP/ICE
 * and owns authoritative room state: who is approved, who is backstage vs on stage.
 * Room capacity of 10 matches the shipped client ("of 10 participants").
 */
import { randomUUID } from 'node:crypto'
import type { WebSocket } from 'ws'
import type {
  ChatMessage,
  Participant,
  ParticipantState,
  Role,
  RoomSnapshot,
  ServerMessage,
} from '@studio/shared'

const COLORS = ['#2864f0', '#7c5cfc', '#24c875', '#43c7e8', '#f4c84a', '#ef4b55']
export const ROOM_CAPACITY = 10

interface Member {
  participant: Participant
  socket: WebSocket
}

export class Room {
  readonly id: string
  title = 'Untitled stream'
  requireApproval = true
  live = false
  recording = false
  startedAt: number | null = null
  hostId: string | null = null

  private members = new Map<string, Member>()
  private chat: ChatMessage[] = []

  constructor(id: string) {
    this.id = id
  }

  get size() {
    return this.members.size
  }

  get isEmpty() {
    return this.members.size === 0
  }

  join(name: string, role: Role, socket: WebSocket): Participant {
    const id = randomUUID()
    const isHost = role === 'host' && this.hostId === null

    const participant: Participant = {
      id,
      name: name.trim() || (isHost ? 'Host' : 'Guest'),
      role: isHost ? 'host' : 'guest',
      state: 'backstage',
      /* Host is always in; guests wait unless approval is off. */
      approved: isHost || !this.requireApproval,
      micOn: false,
      camOn: false,
      screenOn: false,
      color: COLORS[this.members.size % COLORS.length],
      joinedAt: Date.now(),
    }

    if (isHost) this.hostId = id
    this.members.set(id, { participant, socket })
    return participant
  }

  leave(id: string) {
    this.members.delete(id)
    if (this.hostId === id) {
      this.hostId = null
      /* Promote the earliest remaining participant so the room stays controllable. */
      const next = [...this.members.values()].sort(
        (a, b) => a.participant.joinedAt - b.participant.joinedAt,
      )[0]
      if (next) {
        next.participant.role = 'host'
        next.participant.approved = true
        this.hostId = next.participant.id
      }
    }
  }

  get(id: string) {
    return this.members.get(id)?.participant
  }

  socketOf(id: string) {
    return this.members.get(id)?.socket
  }

  isHost(id: string) {
    return this.hostId === id
  }

  setMedia(id: string, patch: Partial<Pick<Participant, 'micOn' | 'camOn' | 'screenOn'>>) {
    const m = this.members.get(id)
    if (!m) return
    Object.assign(m.participant, patch)
  }

  setApproved(id: string, approved: boolean) {
    const m = this.members.get(id)
    if (!m) return
    m.participant.approved = approved
  }

  setStage(id: string, state: ParticipantState) {
    const m = this.members.get(id)
    if (!m) return
    m.participant.state = state
  }

  addChat(msg: ChatMessage) {
    this.chat.push(msg)
    if (this.chat.length > 500) this.chat.shift()
  }

  get history() {
    return this.chat
  }

  snapshot(): RoomSnapshot {
    return {
      id: this.id,
      title: this.title,
      hostId: this.hostId,
      participants: [...this.members.values()].map((m) => m.participant),
      live: this.live,
      recording: this.recording,
      startedAt: this.startedAt,
      requireApproval: this.requireApproval,
      capacity: ROOM_CAPACITY,
    }
  }

  send(id: string, msg: ServerMessage) {
    const sock = this.socketOf(id)
    if (sock && sock.readyState === sock.OPEN) sock.send(JSON.stringify(msg))
  }

  broadcast(msg: ServerMessage, exclude?: string) {
    const payload = JSON.stringify(msg)
    for (const [id, m] of this.members) {
      if (id === exclude) continue
      if (m.socket.readyState === m.socket.OPEN) m.socket.send(payload)
    }
  }

  broadcastRoom() {
    this.broadcast({ t: 'room', room: this.snapshot() })
  }
}

export class RoomRegistry {
  private rooms = new Map<string, Room>()

  getOrCreate(id: string): Room {
    let room = this.rooms.get(id)
    if (!room) {
      room = new Room(id)
      this.rooms.set(id, room)
    }
    return room
  }

  get(id: string) {
    return this.rooms.get(id)
  }

  /** Drop empty rooms so the registry doesn't leak. */
  prune(id: string) {
    const room = this.rooms.get(id)
    if (room?.isEmpty) this.rooms.delete(id)
  }

  get count() {
    return this.rooms.size
  }
}
