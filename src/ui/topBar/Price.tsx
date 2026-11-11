import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';

import { TOP_BAR } from '@/ui/content/topBar';
import type { Quote } from '@/lib/data';
import { formatMoney } from '@/ui/utils/money';

import { AnimatedPrice } from './AnimatedPrice';
import { PriceBreakdown } from './PriceBreakdown';

/** The card comes down from the price the way the dock's trays come up. */
const CARD = {
  hidden: { opacity: 0, y: -8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

interface Props {
  quote: Quote;
}

/**
 * The total, counting to its new value after each change. Pressing it opens
 * the breakdown; Escape or a press outside closes it.
 */
export const Price: React.FC<Props> = ({ quote }) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const cardId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === 'Escape' && setOpen(false);
    const onPress = (event: PointerEvent) =>
      !root.current?.contains(event.target as Node) && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPress);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPress);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={cardId}
        aria-label={TOP_BAR.showBreakdown}
        onClick={() => setOpen((was) => !was)}
        className="group -mx-2 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xl font-semibold tabular-nums transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <AnimatedPrice cents={quote.totalCents} currency={quote.currency} />
        <ChevronDown
          aria-hidden
          className="size-4 text-foreground/50 transition-transform duration-300 group-aria-expanded:rotate-180"
        />
      </button>
      {/* What a screen reader hears: the final price once ("Total €1,314"),
          not every step of the count. Polite, and read as a whole. */}
      <span aria-live="polite" aria-atomic className="sr-only">
        {`${TOP_BAR.total} ${formatMoney(quote.totalCents, quote.currency)}`}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            id={cardId}
            variants={CARD}
            initial="hidden"
            animate="shown"
            exit="hidden"
            className="absolute top-full left-0 z-10 mt-2 w-max max-w-[calc(100vw-2rem)] rounded-3xl border bg-background p-5 shadow-xl"
          >
            <PriceBreakdown quote={quote} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
