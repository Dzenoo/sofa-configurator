import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { LOADER } from '@/content/loader';
import { useLoading } from '@/store/loading/useLoading';

const COUNT = {
  /**
   * 0–100; where the number stands before any file has arrived. The scene's
   * own code downloads first and can't be measured, so the count starts
   * moving at once instead of sitting at zero.
   */
  start: 10,
  /** 0–100; where it stands when every file has arrived but the scene isn't on screen yet. */
  loaded: 90,
  /** Speed the shown number follows the real one, per second: it glides, files arrive in jumps. */
  damping: 4,
  /** 0–100; close enough to 100 to call it finished. */
  finished: 99.5,
};
/** Seconds; the screen fades away over the scene that is already there. */
const LEAVE = { duration: 0.7, ease: 'easeInOut' } as const;

/**
 * The first thing on the page: a full-screen count to 100 in the scene's own
 * color, so what it uncovers is the same surface with the sofa on it.
 */
export const Loader: React.FC = () => {
  const done = useLoading((state) => state.done);
  const number = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (done) return;
    // The shown number changes every frame: written straight to the page.
    let shown = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const { progress, ready, finish } = useLoading.getState();
      const goal = ready
        ? 100
        : COUNT.start + (COUNT.loaded - COUNT.start) * progress;
      shown +=
        (goal - shown) * (1 - Math.exp((-COUNT.damping * (now - last)) / 1000));
      last = now;

      if (number.current)
        number.current.textContent = String(Math.round(shown));
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;

      if (ready && shown >= COUNT.finished) finish();
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          role="status"
          exit={{ opacity: 0 }}
          transition={LEAVE}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-scene"
        >
          <span className="sr-only">{LOADER.status}</span>
          <span
            ref={number}
            aria-hidden
            className="font-heading text-8xl leading-none lg:text-9xl"
          >
            0
          </span>
          <span aria-hidden className="h-px w-40 bg-foreground/15">
            <span
              ref={bar}
              className="block h-full origin-left scale-x-0 bg-primary"
            />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
