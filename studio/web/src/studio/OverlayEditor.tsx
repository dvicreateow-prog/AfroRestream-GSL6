import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX, CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useStudio } from '../state/studioStore';

/* ------------------------------------------------------------------ *
 * Direct-manipulation layer that sits exactly on top of the stage
 * canvas. Boxes are laid out in percentages so the editor is resolution
 * independent: pointer deltas are measured against the layer's own
 * bounding rect and converted back into percentage space before they
 * are committed to the store.
 * ------------------------------------------------------------------ */

const MIN = 5; // minimum overlay size, in percent, on each axis

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type DragMode = 'move' | ResizeHandle;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface OverlayBox extends Box {
  id: string;
  name: string;
  visible: boolean;
}

interface DragState {
  id: string;
  mode: DragMode;
  pointerId: number;
  originX: number;
  originY: number;
  rectW: number;
  rectH: number;
  start: Box;
  node: HTMLDivElement;
}

const HANDLES: readonly ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

const CURSORS: Record<ResizeHandle, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
};

const OFFSETS: Record<ResizeHandle, { left: string; top: string }> = {
  n: { left: '50%', top: '0%' },
  s: { left: '50%', top: '100%' },
  e: { left: '100%', top: '50%' },
  w: { left: '0%', top: '50%' },
  ne: { left: '100%', top: '0%' },
  nw: { left: '0%', top: '0%' },
  se: { left: '100%', top: '100%' },
  sw: { left: '0%', top: '100%' },
};

function clamp(value: number, low: number, high: number): number {
  if (high < low) return low;
  return value < low ? low : value > high ? high : value;
}

function tidy(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalise(box: Box): Box {
  const w = clamp(box.w, MIN, 100);
  const h = clamp(box.h, MIN, 100);
  return {
    x: tidy(clamp(box.x, 0, 100 - w)),
    y: tidy(clamp(box.y, 0, 100 - h)),
    w: tidy(w),
    h: tidy(h),
  };
}

function moveBox(start: Box, dx: number, dy: number): Box {
  return normalise({ x: start.x + dx, y: start.y + dy, w: start.w, h: start.h });
}

function resizeBox(
  handle: ResizeHandle,
  start: Box,
  dx: number,
  dy: number,
  keepRatio: boolean,
): Box {
  const right = start.x + start.w;
  const bottom = start.y + start.h;
  let x = start.x;
  let y = start.y;
  let w = start.w;
  let h = start.h;

  if (handle.indexOf('e') >= 0) w = clamp(start.w + dx, MIN, 100 - start.x);
  if (handle.indexOf('w') >= 0) {
    x = clamp(start.x + dx, 0, right - MIN);
    w = right - x;
  }
  if (handle.indexOf('s') >= 0) h = clamp(start.h + dy, MIN, 100 - start.y);
  if (handle.indexOf('n') >= 0) {
    y = clamp(start.y + dy, 0, bottom - MIN);
    h = bottom - y;
  }

  const isCorner = handle.length === 2;
  if (keepRatio && isCorner && start.w > 0 && start.h > 0) {
    const ratio = start.w / start.h;
    if (w / h > ratio) w = h * ratio;
    else h = w / ratio;
    w = clamp(w, MIN, 100);
    h = clamp(h, MIN, 100);
    if (handle.indexOf('w') >= 0) x = right - w;
    if (handle.indexOf('n') >= 0) y = bottom - h;
    if (x < 0) {
      w += x;
      x = 0;
    }
    if (y < 0) {
      h += y;
      y = 0;
    }
    if (x + w > 100) w = 100 - x;
    if (y + h > 100) h = 100 - y;
  }

  return {
    x: tidy(clamp(x, 0, 100 - MIN)),
    y: tidy(clamp(y, 0, 100 - MIN)),
    w: tidy(clamp(w, MIN, 100 - x)),
    h: tidy(clamp(h, MIN, 100 - y)),
  };
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function OverlayEditor(): JSX.Element | null {
  const editMode = useStudio((s) => s.editMode);
  const overlays = useStudio((s) => s.overlays) as OverlayBox[];
  const updateOverlay = useStudio((s) => s.updateOverlay);
  const removeOverlay = useStudio((s) => s.removeOverlay);

  const layerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<{ id: string; box: Box } | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const flush = useCallback((): void => {
    frameRef.current = null;
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    updateOverlay(pending.id, pending.box);
  }, [updateOverlay]);

  const queue = useCallback(
    (id: string, box: Box): void => {
      pendingRef.current = { id, box };
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(flush);
      }
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      pendingRef.current = null;
      dragRef.current = null;
    };
  }, []);

  // Keyboard: escape clears the selection, delete removes the overlay.
  useEffect(() => {
    if (!editMode) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;
      if (event.key === 'Escape') {
        setSelectedId(null);
        return;
      }
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      if (!selectedId) return;
      event.preventDefault();
      removeOverlay(selectedId);
      setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editMode, selectedId, removeOverlay]);

  const beginDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, overlay: OverlayBox, mode: DragMode): void => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const layer = layerRef.current;
      if (!layer) return;
      const rect = layer.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      event.preventDefault();
      event.stopPropagation();
      const node = event.currentTarget;
      node.setPointerCapture(event.pointerId);
      dragRef.current = {
        id: overlay.id,
        mode,
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        rectW: rect.width,
        rectH: rect.height,
        start: { x: overlay.x, y: overlay.y, w: overlay.w, h: overlay.h },
        node,
      };
      setSelectedId(overlay.id);
      setDragging(overlay.id);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      const dx = ((event.clientX - drag.originX) / drag.rectW) * 100;
      const dy = ((event.clientY - drag.originY) / drag.rectH) * 100;
      const next =
        drag.mode === 'move'
          ? moveBox(drag.start, dx, dy)
          : resizeBox(drag.mode, drag.start, dx, dy, event.shiftKey);
      queue(drag.id, next);
    },
    [queue],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setDragging(null);
      if (drag.node.hasPointerCapture(event.pointerId)) {
        drag.node.releasePointerCapture(event.pointerId);
      }
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      flush();
    },
    [flush],
  );

  if (!editMode) return null;

  const layerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 8,
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'default',
  };

  return (
    <div
      ref={layerRef}
      style={layerStyle}
      onPointerDown={() => setSelectedId(null)}
      role="presentation"
    >
      {overlays
        .filter((overlay) => overlay.visible)
        .map((overlay) => {
          const selected = overlay.id === selectedId;
          const hovered = overlay.id === hoverId;
          const active = overlay.id === dragging;
          const boxStyle: CSSProperties = {
            position: 'absolute',
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            width: `${overlay.w}%`,
            height: `${overlay.h}%`,
            boxSizing: 'border-box',
            borderRadius: 'var(--r-sm)',
            border: selected
              ? '2px solid var(--brand-primary)'
              : `1px solid rgba(255,255,255,${hovered ? 0.62 : 0.24})`,
            background: selected || hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
            boxShadow: selected ? '0 0 0 1px rgba(0,0,0,0.45)' : 'none',
            cursor: active ? 'grabbing' : 'grab',
            transition: active ? 'none' : 'border-color var(--d-fast) var(--e-standard)',
            touchAction: 'none',
          };

          return (
            <div
              key={overlay.id}
              style={boxStyle}
              onPointerDown={(event) => beginDrag(event, overlay, 'move')}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onMouseEnter={() => setHoverId(overlay.id)}
              onMouseLeave={() => setHoverId((id) => (id === overlay.id ? null : id))}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 4,
                  top: 4,
                  maxWidth: 'calc(100% - 8px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '2px 6px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 11,
                  lineHeight: 1.4,
                  fontWeight: 'var(--fw-semibold)',
                  color: selected ? '#fff' : 'var(--c-text-dim)',
                  background: selected ? 'var(--brand-primary)' : 'rgba(0,0,0,0.55)',
                  pointerEvents: 'none',
                }}
              >
                {overlay.name}
              </span>

              {active ? (
                <span
                  style={{
                    position: 'absolute',
                    right: 4,
                    bottom: 4,
                    padding: '2px 6px',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 10,
                    fontWeight: 'var(--fw-medium)',
                    color: 'var(--c-text)',
                    background: 'rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                  }}
                >
                  {Math.round(overlay.w)}% x {Math.round(overlay.h)}%
                </span>
              ) : null}

              {selected
                ? HANDLES.map((handle) => (
                    <div
                      key={handle}
                      onPointerDown={(event) => beginDrag(event, overlay, handle)}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      style={{
                        position: 'absolute',
                        left: OFFSETS[handle].left,
                        top: OFFSETS[handle].top,
                        width: 11,
                        height: 11,
                        marginLeft: -6,
                        marginTop: -6,
                        boxSizing: 'border-box',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.9)',
                        background: 'var(--brand-primary)',
                        cursor: CURSORS[handle],
                        touchAction: 'none',
                      }}
                    />
                  ))
                : null}
            </div>
          );
        })}
    </div>
  );
}

export default OverlayEditor;
