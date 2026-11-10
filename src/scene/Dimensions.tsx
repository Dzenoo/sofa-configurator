import { AnimatePresence, motion } from 'motion/react';

import { SCENE_TEXT } from '@/content/scene';
import { useConfigurator } from '@/store/configurator/useConfigurator';

/** Seconds; the old size fades out, then the new one fades in. */
const FADE = { duration: 0.2 };

/**
 * Outer size of the chosen layout, from the catalog, in the scene's corner
 * away from the sofa. Plain text, so it stays sharp and readable at any zoom.
 */
export const Dimensions: React.FC = () => {
  const meta = useConfigurator(
    (state) =>
      state.catalog?.options.find((o) => o.key === state.selection?.layout)
        ?.meta,
  );
  if (!meta?.widthCm || !meta.depthCm) return null;
  const text = SCENE_TEXT.dimensions(meta.widthCm, meta.depthCm);

  return (
    <p className="absolute right-4 bottom-4 text-right text-sm">
      <span className="block text-xs text-foreground/60">
        {SCENE_TEXT.dimensionsLabel}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          className="block font-medium tabular-nums"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </p>
  );
};
