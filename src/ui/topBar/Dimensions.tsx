import { AnimatePresence, motion } from 'motion/react';

import { TOP_BAR } from '@/ui/content/topBar';
import { useConfigurator } from '@/store/configurator/useConfigurator';

/** Seconds; the old size fades out, then the new one fades in. */
const FADE = { duration: 0.2 };

/** Outer size of the chosen layout, from the catalog, under the price. */
export const Dimensions: React.FC = () => {
  const meta = useConfigurator(
    (state) =>
      state.catalog?.options.find((o) => o.key === state.selection?.layout)
        ?.meta,
  );
  if (!meta?.widthCm || !meta.depthCm) return null;
  const text = TOP_BAR.dimensions(meta.widthCm, meta.depthCm);

  return (
    <p className="text-sm text-foreground/60 tabular-nums">
      <span className="sr-only">{TOP_BAR.dimensionsLabel}: </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </p>
  );
};
