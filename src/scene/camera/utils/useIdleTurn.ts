import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';

import { useView } from '@/store/view/useView';

/** The part of the orbit controls this hook listens to (R3F only types them as an event dispatcher). */
interface Controls {
  addEventListener: (type: 'start' | 'end', listener: () => void) => void;
  removeEventListener: (type: 'start' | 'end', listener: () => void) => void;
}

/**
 * Whether the sofa may turn by itself right now: only while nobody is
 * touching the view. A drag or a zoom stops it at once, and so does a new
 * layout or "Reset view", which move the camera themselves; it comes back
 * after a pause. Never for visitors who asked for less motion.
 */
export function useIdleTurn(layout: string, pauseMs: number): boolean {
  const controls = useThree((state) => state.controls) as Controls | null;
  const invalidate = useThree((state) => state.invalidate);
  const resets = useView((state) => state.resets);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!controls) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: number | undefined;
    const rest = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), pauseMs);
    };
    const busy = () => {
      window.clearTimeout(timer);
      setIdle(false);
    };

    // Every run of this effect is a moment the view was just set or moved:
    // the first frame, a new layout, a reset.
    busy();
    rest();
    controls.addEventListener('start', busy);
    controls.addEventListener('end', rest);
    return () => {
      window.clearTimeout(timer);
      controls.removeEventListener('start', busy);
      controls.removeEventListener('end', rest);
    };
  }, [controls, layout, resets, pauseMs]);

  // The canvas draws on demand: the turn needs a first frame to get going,
  // and from then on every step asks for the next one.
  useEffect(() => {
    if (idle) invalidate();
  }, [idle, invalidate]);

  return idle;
}
