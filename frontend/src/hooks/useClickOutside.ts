import { useEffect, type RefObject } from 'react'

type ElementRef = RefObject<HTMLElement | null>

export function useClickOutside(
  refs: ElementRef | ElementRef[],
  onOutsideClick: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const elementRefs = Array.isArray(refs) ? refs : [refs]
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      const clickedInside = elementRefs.some((ref) => ref.current?.contains(target))

      if (!clickedInside) {
        onOutsideClick()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [enabled, onOutsideClick, refs])
}
