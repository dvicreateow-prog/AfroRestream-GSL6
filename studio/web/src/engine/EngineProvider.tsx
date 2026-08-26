/*
 * One engine binding per Studio page.
 *
 * useStudioEngine subscribes to the engine and owns local state, so calling it from
 * several components created competing bindings to the same singleton. The Studio
 * mounts it once here and every component reads the same value through context.
 */
import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useStudioEngine } from './useStudioEngine'
import { useRoom, type RoomBinding } from './useRoom'

type EngineBinding = ReturnType<typeof useStudioEngine> & { room: RoomBinding }

const EngineContext = createContext<EngineBinding | null>(null)

export function EngineProvider({ children }: { children: ReactNode }) {
  const binding = useStudioEngine()
  const room = useRoom()
  const { roomId } = useParams()

  /* Join the room as host so guest streams reach the compositor. Without this the
   * guest page can connect and still never appear on stage. */
  const target = roomId ?? 'studio'
  const { join } = room
  useEffect(() => {
    void join(target)
  }, [join, target])

  return (
    <EngineContext.Provider value={{ ...binding, room }}>{children}</EngineContext.Provider>
  )
}

export function useEngine(): EngineBinding {
  const ctx = useContext(EngineContext)
  if (!ctx) throw new Error('useEngine must be used inside <EngineProvider>')
  return ctx
}
