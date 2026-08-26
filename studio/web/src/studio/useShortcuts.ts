import { useEffect, useRef } from 'react'
import type { LayoutId } from '@studio/shared'
import { useActiveScene, useStudio } from '../state/studioStore'
import { useEngine } from '../engine/EngineProvider'

/* ------------------------------------------------------------------ */
/* Binding table - this is what the "Keyboard shortcuts" sheet renders  */
/* ------------------------------------------------------------------ */

export interface Binding {
  id: string
  /** Human-readable key combo, e.g. "Shift + S". Display only. */
  keys: string
  label: string
  group: string
}

export const BINDINGS: Binding[] = [
  /* General */
  { id: 'showShortcuts', keys: '?', label: 'Show keyboard shortcuts', group: 'General' },
  { id: 'dismiss', keys: 'Esc', label: 'Close the open dialog or panel', group: 'General' },

  /* Controls */
  { id: 'toggleMic', keys: 'M', label: 'Mute or unmute your microphone', group: 'Controls' },
  { id: 'toggleCamera', keys: 'V', label: 'Turn your camera on or off', group: 'Controls' },
  { id: 'toggleScreen', keys: 'Shift + S', label: 'Start or stop screen sharing', group: 'Controls' },
  { id: 'toggleRecording', keys: 'R', label: 'Start or end recording', group: 'Controls' },

  /* Scenes */
  { id: 'selectScene', keys: '1 - 9', label: 'Switch to scene 1 through 9', group: 'Scenes' },
  { id: 'addScene', keys: 'N', label: 'Add a new scene', group: 'Scenes' },
  { id: 'previousScene', keys: '[', label: 'Previous scene', group: 'Scenes' },
  { id: 'nextScene', keys: ']', label: 'Next scene', group: 'Scenes' },

  /* Sources */
  { id: 'openSources', keys: 'O', label: 'Open the sources panel', group: 'Sources' },

  /* Layout */
  { id: 'cycleLayout', keys: 'L', label: 'Cycle through the layouts', group: 'Layout' },

  /* Other */
  { id: 'openChat', keys: 'C', label: 'Open chat', group: 'Other' },
  { id: 'openGraphics', keys: 'G', label: 'Open graphics and overlays', group: 'Other' },
]

/* The seven selectable layouts, in the order the layout row shows them.
   'custom' is reached from the Customize button, never from the L key. */
const LAYOUT_CYCLE: LayoutId[] = ['solo', 'split', 'stacked', 'grid', 'pip', 'spotlight', 'screen']

/* NOTE: number-row bindings must use KeyboardEvent.code values "Digit1".."Digit9".
   An older build of this screen registered them as "Key1".."Key7" - those codes
   only exist for letter keys, so the DOM never emits them and the scene/layout
   number shortcuts silently never fired. Keep these as Digit*. */
const DIGITS: string[] = [
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
]

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Attaches a single window keydown listener for the whole Studio.
 * The handler body lives in a ref so the listener is registered once and
 * still sees fresh store state on every keypress.
 */
export function useShortcuts(opts: { onShowHelp: () => void }): void {
  const scenes = useStudio((s) => s.scenes)
  const activeSceneId = useStudio((s) => s.activeSceneId)
  const modal = useStudio((s) => s.modal)
  const selectScene = useStudio((s) => s.selectScene)
  const addScene = useStudio((s) => s.addScene)
  const setLayout = useStudio((s) => s.setLayout)
  const setPanel = useStudio((s) => s.setPanel)
  const closePanel = useStudio((s) => s.closePanel)
  const closeModal = useStudio((s) => s.closeModal)
  const toggleRecording = useStudio((s) => s.toggleRecording)
  const activeScene = useActiveScene()
  const { toggleMic, toggleCamera, toggleScreen } = useEngine()

  const onShowHelp = opts.onShowHelp
  const handlerRef = useRef<(e: KeyboardEvent) => void>(() => undefined)

  useEffect(() => {
    handlerRef.current = (e: KeyboardEvent): void => {
      /* Never steal keys from a field the user is typing in. */
      if (isTypingTarget(e.target)) return

      /* Escape always works, even over a dialog: dialog first, then panel. */
      if (e.code === 'Escape') {
        e.preventDefault()
        if (modal !== null) closeModal()
        else closePanel()
        return
      }

      /* Everything else is suppressed while a dialog owns the screen. */
      if (modal !== null) return

      /* Leave browser and OS combos alone. */
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return

      const shift = e.shiftKey

      /* Scene numbers: 1..9 jump straight to that scene. */
      const digit = DIGITS.indexOf(e.code)
      if (digit !== -1) {
        if (shift) return
        const scene = scenes[digit]
        if (scene) {
          e.preventDefault()
          selectScene(scene.id)
        }
        return
      }

      const index = scenes.findIndex((s) => s.id === activeSceneId)

      switch (e.code) {
        case 'KeyM':
          if (shift) return
          e.preventDefault()
          void toggleMic()
          return
        case 'KeyV':
          if (shift) return
          e.preventDefault()
          void toggleCamera()
          return
        case 'KeyS':
          if (!shift) return
          e.preventDefault()
          void toggleScreen()
          return
        case 'KeyR':
          if (shift) return
          e.preventDefault()
          toggleRecording()
          return
        case 'KeyN':
          if (shift) return
          e.preventDefault()
          addScene('camera', 'Untitled scene')
          return
        case 'BracketLeft':
          if (shift || scenes.length === 0 || index === -1) return
          e.preventDefault()
          selectScene(scenes[(index - 1 + scenes.length) % scenes.length].id)
          return
        case 'BracketRight':
          if (shift || scenes.length === 0 || index === -1) return
          e.preventDefault()
          selectScene(scenes[(index + 1) % scenes.length].id)
          return
        case 'KeyL': {
          if (shift) return
          e.preventDefault()
          const current = activeScene ? LAYOUT_CYCLE.indexOf(activeScene.layout) : -1
          setLayout(LAYOUT_CYCLE[(current + 1) % LAYOUT_CYCLE.length])
          return
        }
        case 'KeyC':
          if (shift) return
          e.preventDefault()
          setPanel('chat')
          return
        case 'KeyG':
          if (shift) return
          e.preventDefault()
          setPanel('graphics')
          return
        case 'KeyO':
          if (shift) return
          e.preventDefault()
          setPanel('sources')
          return
        case 'Slash':
          if (!shift) return
          e.preventDefault()
          onShowHelp()
          return
        default:
      }
    }
  })

  useEffect(() => {
    const listener = (e: KeyboardEvent): void => {
      handlerRef.current(e)
    }
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [])
}
