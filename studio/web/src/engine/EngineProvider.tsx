/*
 * One engine binding per Studio page.
 *
 * useStudioEngine subscribes to the engine and owns local state, so calling it from
 * several components created competing bindings to the same singleton. The Studio
 * mounts it once here and every component reads the same value through context.
 */
import { createContext, useContext, type ReactNode } from 'react'
import { useStudioEngine } from './useStudioEngine'

type EngineBinding = ReturnType<typeof useStudioEngine>

const EngineContext = createContext<EngineBinding | null>(null)

export function EngineProvider({ children }: { children: ReactNode }) {
  const binding = useStudioEngine()
  return <EngineContext.Provider value={binding}>{children}</EngineContext.Provider>
}

export function useEngine(): EngineBinding {
  const ctx = useContext(EngineContext)
  if (!ctx) throw new Error('useEngine must be used inside <EngineProvider>')
  return ctx
}
