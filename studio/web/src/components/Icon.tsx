/*
 * Icon set.
 *
 * The capture showed Studio renders Lucide icons - the SVGs carry
 * `class="lucide lucide-wand-sparkles"`, `lucide-captions`, `lucide-timer`,
 * `lucide-paintbrush`, `lucide-life-buoy` and friends. So we use lucide-react
 * (ISC) rather than redrawing them, which matches Studio exactly and stays
 * cleanly licensed.
 *
 * Brand marks are not part of Lucide and are kept as local paths.
 * Studio-specific glyphs live in src/assets/icons (see icons.json).
 */
import type { SVGProps } from 'react'
import {
  ArrowDown, ArrowRight, Calendar, Captions, Check, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Circle, Clock, Component, Copy, CornerDownLeft,
  AppWindow, Columns2, Eye, Files, Grid2x2, GripVertical, Image as ImageIcon,
  Info, Layers,
  LayoutGrid, LifeBuoy, Link as LinkIcon, Lock, Maximize, Mic, MicOff,
  MonitorUp, MonitorX, MoreHorizontal, MoreVertical, NotebookPen, Paintbrush,
  Paperclip, Pause, Pencil, PictureInPicture2, Pin, Play, Plus, Presentation,
  PanelRight, QrCode, Radio, RefreshCw, Rows2, Search, Send, Settings,
  SignalHigh, SlidersHorizontal,
  Square, SquareUser, Timer, Trash2, TriangleAlert, Upload, UserPlus,
  Users, Video, VideoOff, Volume2, VolumeX, WandSparkles, X,
  type LucideIcon,
} from 'lucide-react'

export type IconName =
  | 'plus' | 'close' | 'check' | 'chevronDown' | 'chevronRight' | 'chevronLeft'
  | 'chevronUp' | 'more' | 'moreH' | 'pencil' | 'trash' | 'copy' | 'link'
  | 'refresh' | 'arrowDown' | 'arrowRight' | 'cornerDownLeft' | 'paperclip'
  | 'mic' | 'micOff' | 'cam' | 'camOff' | 'screen' | 'screenOff'
  | 'people' | 'personPlus' | 'settings' | 'help' | 'search'
  | 'chat' | 'graphics' | 'theme' | 'captions' | 'qr' | 'notes' | 'sources'
  | 'record' | 'stop' | 'play' | 'pause' | 'upload' | 'image' | 'video'
  | 'countdown' | 'browser' | 'rtmp' | 'slides' | 'grid' | 'star' | 'layers'
  | 'volume' | 'volumeOff' | 'pin' | 'send' | 'eye' | 'clock' | 'calendar'
  | 'youtube' | 'twitch' | 'facebook' | 'linkedin' | 'x' | 'kick'
  | 'layoutSolo' | 'layoutSplit' | 'layoutStacked' | 'layoutGrid'
  | 'layoutPip' | 'layoutSpotlight' | 'layoutScreen' | 'layoutCustom'
  | 'fullscreen' | 'drag' | 'lock' | 'warning' | 'info' | 'signal'

/* Lucide names verified against the captured markup where one was present. */
const LUCIDE: Partial<Record<IconName, LucideIcon>> = {
  plus: Plus,                    // lucide-plus       [observed]
  close: X,
  check: Check,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronUp: ChevronUp,          // lucide-chevron-up [observed]
  more: MoreVertical,
  moreH: MoreHorizontal,
  pencil: Pencil,                // lucide-pencil     [observed]
  trash: Trash2,                 // lucide-trash-2    [observed]
  copy: Copy,
  link: LinkIcon,
  refresh: RefreshCw,
  arrowDown: ArrowDown,          // lucide-arrow-down [observed]
  arrowRight: ArrowRight,        // lucide-arrow-right[observed]
  cornerDownLeft: CornerDownLeft,// lucide-corner-down-left [observed]
  paperclip: Paperclip,          // lucide-paperclip  [observed]

  mic: Mic,
  micOff: MicOff,
  cam: Video,
  camOff: VideoOff,
  screen: MonitorUp,
  screenOff: MonitorX,

  people: Users,
  personPlus: UserPlus,
  settings: Settings,
  help: LifeBuoy,                // lucide-life-buoy  [observed]
  search: Search,

  chat: SquareUser,
  graphics: ImageIcon,
  theme: Paintbrush,             // lucide-paintbrush [observed]
  captions: Captions,            // lucide-captions   [observed]
  qr: QrCode,
  notes: NotebookPen,
  sources: Component,            // lucide-component  [observed]

  record: Circle,
  stop: Square,
  play: Play,
  pause: Pause,
  upload: Upload,
  image: ImageIcon,
  video: Video,
  countdown: Timer,              // lucide-timer      [observed]
  browser: Files,
  rtmp: Radio,
  slides: Presentation,
  grid: LayoutGrid,
  star: WandSparkles,            // lucide-wand-sparkles [observed]
  layers: Layers,                // lucide-layers     [observed]

  volume: Volume2,
  volumeOff: VolumeX,
  pin: Pin,
  send: Send,
  eye: Eye,
  clock: Clock,
  calendar: Calendar,            // lucide-calendar   [observed]

  layoutSolo: Square,
  layoutSplit: Columns2,
  layoutStacked: Rows2,
  layoutGrid: Grid2x2,
  layoutPip: PictureInPicture2,
  layoutSpotlight: PanelRight,
  layoutScreen: AppWindow,
  layoutCustom: SlidersHorizontal,

  fullscreen: Maximize,
  drag: GripVertical,
  lock: Lock,
  warning: TriangleAlert,
  info: Info,
  signal: SignalHigh,
}

/* Brand marks - not in Lucide. */
const BRAND: Partial<Record<IconName, string>> = {
  youtube:
    'M17.6 6.2a2 2 0 0 0-1.4-1.4C15 4.5 10 4.5 10 4.5s-5 0-6.2.3A2 2 0 0 0 2.4 6.2C2.1 7.4 2.1 10 2.1 10s0 2.6.3 3.8a2 2 0 0 0 1.4 1.4c1.2.3 6.2.3 6.2.3s5 0 6.2-.3a2 2 0 0 0 1.4-1.4c.3-1.2.3-3.8.3-3.8s0-2.6-.3-3.8zM8.4 12.4V7.6l4.2 2.4z',
  twitch:
    'M4.4 2.5L2.8 6.3v10.2h3.5V19h2l2.4-2.5h2.8L18 12V2.5zm12 8.8l-2.3 2.3H10l-2 2v-2H5.1V4.1h11.3zM12.6 6.5h1.6v4.2h-1.6zm-4 0h1.6v4.2H8.6z',
  facebook:
    'M17 10a7 7 0 1 0-8.1 6.9v-4.9H7.1V10h1.8V8.4c0-1.8 1.1-2.8 2.7-2.8.8 0 1.6.1 1.6.1v1.8h-.9c-.9 0-1.2.6-1.2 1.1V10h2l-.3 2h-1.7v4.9A7 7 0 0 0 17 10z',
  linkedin:
    'M15.6 2.5H4.4a1.9 1.9 0 0 0-1.9 1.9v11.2a1.9 1.9 0 0 0 1.9 1.9h11.2a1.9 1.9 0 0 0 1.9-1.9V4.4a1.9 1.9 0 0 0-1.9-1.9zM7 15H5V8.4h2zM6 7.5a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zM15 15h-2v-3.2c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.7V15h-2V8.4h1.9v.9h.1a2.1 2.1 0 0 1 1.9-1c2 0 2.4 1.3 2.4 3.1z',
  x: 'M13.9 3h2.4l-5.2 6 6.2 8.2h-4.9l-3.8-5-4.4 5H1.8l5.6-6.4L1.5 3h5l3.5 4.6zm-.9 12.8h1.4L6.9 4.4H5.4z',
  kick: 'M3 3h4.3v3.6h1.4V5h1.4V3.4h4.3v4.3h-1.4v1.4h-1.4v1.8h1.4v1.4h1.4V17h-4.3v-1.6H8.7V14H7.3v3H3z',
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const brand = BRAND[name]
  if (brand) {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...rest}>
        <path d={brand} fill="currentColor" />
      </svg>
    )
  }

  const L = LUCIDE[name]
  if (!L) return null

  /* record reads as a filled dot in the header, matching Studio. */
  const filled = name === 'record' || name === 'stop'
  return (
    <L
      width={size}
      height={size}
      strokeWidth={1.8}
      aria-hidden="true"
      {...(filled ? { fill: 'currentColor' } : {})}
      {...rest}
    />
  )
}
