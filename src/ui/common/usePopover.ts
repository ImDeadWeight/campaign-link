/**
 * @file Positioning and dismissal for dropdown popups (used by Select and
 * SearchPicker).
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/** Tallest a popup list gets before it scrolls. */
const MAX_HEIGHT = 280;
/** Space between the anchor and the popup. */
const GAP = 4;

/**
 * Keeps option `index` visible by scrolling the list only. scrollIntoView
 * would also scroll ancestors, which counts as an outside scroll and closes the popup.
 */
export function scrollOptionIntoView(list: HTMLElement | null, index: number) {
  const item = list?.querySelector<HTMLElement>(`[data-index="${index}"]`);
  if (!list || !item) return;
  if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
  else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
    list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
  }
}

/**
 * Positions a popup under (or above, if there's no room) an anchor element.
 * The popup is fixed-positioned so modals with overflow can't clip it, and
 * closes on outside click, scroll outside the popup, or window resize.
 * `align: 'end'` lines up right edges, for anchors near the right of the screen.
 */
export function usePopover<A extends HTMLElement>(align: 'start' | 'end' = 'start') {
  const anchorRef = useRef<A>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});

  // Close and forget the position, so reopening re-measures.
  const close = useCallback(() => {
    setOpen(false);
    setStyle({});
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - GAP;
    const above = r.top - GAP;
    const flip = below < Math.min(MAX_HEIGHT, 160) && above > below;
    setStyle({
      position: 'fixed',
      ...(align === 'end' ? { right: window.innerWidth - r.right } : { left: r.left }),
      minWidth: r.width,
      maxHeight: Math.min(MAX_HEIGHT, (flip ? above : below) - 8),
      ...(flip ? { bottom: window.innerHeight - r.top + GAP } : { top: r.bottom + GAP }),
    });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const inside = (t: EventTarget | null) =>
      t instanceof Node && (anchorRef.current?.contains(t) || popupRef.current?.contains(t));
    const onDown = (e: PointerEvent) => !inside(e.target) && close();
    const onScroll = (e: Event) => !inside(e.target) && close();
    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open, close]);

  // Not shown until positioned, so it never renders in normal flow and shifts the page.
  const positioned = open && style.position === 'fixed';
  return { anchorRef, popupRef, open, positioned, setOpen, close, style };
}
