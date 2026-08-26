/*
 * API base.
 *
 * The Vite dev proxy stalls on POST bodies: a 2 MB octet-stream POST that the API
 * answers in 22 ms times out at 60 s through the proxy, and a multipart upload that
 * takes 0.33 ms direct never returns at all. So in dev we talk to the API server
 * directly (CORS is enabled server-side). In production the app is served from the
 * same origin, so the base is empty.
 *
 * This is also more correct for the speed test: measuring through the dev proxy would
 * measure the proxy, not the network.
 */
const DEV_API = 'http://localhost:4000'

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  (import.meta.env.DEV ? DEV_API : '')

/** Absolute URL for an API path such as `/api/stream-key`. */
export const api = (path: string): string => `${API_BASE}${path}`

/** Absolute ws:// URL for a socket path such as `/ws/ingest`. */
export const wsUrl = (path: string): string => {
  const base = API_BASE || window.location.origin
  return base.replace(/^http/, 'ws') + path
}
