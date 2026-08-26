import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const SERVER_PORT = process.env.PORT ?? '4000'

/* GitHub Pages serves a project repo under /<repo>/, so the build needs a base.
 * Dev and any root-domain host keep '/'.
 *
 * Takes the bare repo NAME, not a path: Git Bash on Windows rewrites a value that
 * starts with '/' into a real filesystem path (/foo -> C:/Program Files/Git/foo),
 * which silently produced broken asset URLs. No leading slash, nothing to mangle. */
const REPO = process.env.VITE_REPO_BASE?.replace(/^\/+|\/+$/g, '')
const BASE = REPO ? `/${REPO}/` : '/'

export default defineConfig({
  base: BASE,
  plugins: [react()],
  resolve: {
    /* Workspace layout can surface two copies of React; pin to one. */
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@studio/shared': path.resolve(import.meta.dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: `http://localhost:${SERVER_PORT}`, changeOrigin: true },
      '/ws': { target: `ws://localhost:${SERVER_PORT}`, ws: true },
      '/media': { target: `http://localhost:${SERVER_PORT}`, changeOrigin: true },
    },
  },
})
