/*
 * Destinations API client.
 *
 * These rows carry platform stream keys, so every call is authenticated and the
 * server only ever returns the signed-in account's own rows.
 */
import { apiFetch } from './session'

export interface Destination {
  id: string
  platform: string
  name: string
  url: string
  streamKey: string
  enabled: boolean
  createdAt?: number
}

export interface DestinationInput {
  platform?: string
  name?: string
  url: string
  streamKey?: string
  enabled?: boolean
}

/** Ingest endpoints for the platforms we can pre-fill. */
export const PLATFORM_PRESETS: {
  id: string
  label: string
  ingest: string
  help: string
}[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    ingest: 'rtmp://a.rtmp.youtube.com/live2',
    help: 'YouTube Studio -> Go live -> Stream key',
  },
  {
    id: 'twitch',
    label: 'Twitch',
    ingest: 'rtmp://live.twitch.tv/app',
    help: 'Twitch Dashboard -> Settings -> Stream -> Primary stream key',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    ingest: 'rtmps://live-api-s.facebook.com:443/rtmp',
    help: 'Facebook Live Producer -> Streaming software -> Stream key',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    ingest: 'rtmp://1-tls.rtmp.linkedin.com/live',
    help: 'LinkedIn Live -> Stream key',
  },
  {
    id: 'kick',
    label: 'Kick',
    ingest: 'rtmps://fa723fc1b171.global-contribute.live-video.net',
    help: 'Kick Creator Dashboard -> Stream key',
  },
  {
    id: 'custom',
    label: 'Custom RTMP',
    ingest: '',
    help: 'Any RTMP, RTMPS or SRT ingest URL',
  },
]

/** Mirrors the server's validation so mistakes are caught before a round trip. */
export function validateIngestUrl(url: string): string | null {
  const v = url.trim()
  if (!v) return 'Enter the ingest URL for this platform.'
  if (!/^rtmps?:\/\//i.test(v) && !/^srt:\/\//i.test(v)) {
    return 'URL must start with rtmp://, rtmps:// or srt://'
  }
  return null
}

export const destinationsApi = {
  list: () => apiFetch<Destination[]>('/api/destinations'),

  create: (input: DestinationInput) =>
    apiFetch<Destination>('/api/destinations', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, patch: Partial<DestinationInput>) =>
    apiFetch<Destination>(`/api/destinations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  remove: (id: string) =>
    apiFetch<void>(`/api/destinations/${id}`, { method: 'DELETE' }),
}

export interface StreamKeyInfo {
  region: string
  rtmpUrl: string
  rtmpsUrl: string
  srtUrl: string
  streamKey: string
}

export const streamKeyApi = {
  get: (region?: string) =>
    apiFetch<StreamKeyInfo>(
      `/api/stream-key${region ? `?region=${encodeURIComponent(region)}` : ''}`,
    ),
  reset: (region?: string) =>
    apiFetch<{ streamKey: string }>('/api/stream-key/reset', {
      method: 'POST',
      body: JSON.stringify({ region }),
    }),
}
