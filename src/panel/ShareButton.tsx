import { Check, Link2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { PANEL } from '@/content/panel';
import { shareUrl, type Catalog, type Selection } from '@/lib/data';

/** Milliseconds the button says what happened before it goes back to "Share". */
const FEEDBACK_MS = 2500;
/** Seconds; the label fades to the next one instead of swapping. */
const FADE = { duration: 0.15 };

type Status = 'idle' | 'copied' | 'failed';

interface Props {
  catalog: Catalog;
  selection: Selection;
}

/**
 * Copies a link that opens this exact sofa. The address bar already holds
 * the same link, so when the browser refuses to copy, the visitor is pointed
 * there instead of being left with nothing.
 */
export const ShareButton: React.FC<Props> = ({ catalog, selection }) => {
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        shareUrl(catalog, selection, window.location.href),
      );
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  const label =
    status === 'copied'
      ? PANEL.share.copied
      : status === 'failed'
        ? PANEL.share.failed
        : PANEL.share.button;
  const Icon = status === 'copied' ? Check : Link2;

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          className="flex items-center gap-2"
        >
          <Icon aria-hidden className="size-4 shrink-0" />
          {/* Announced when it changes, so "Link copied" is heard too. */}
          <span aria-live="polite">{label}</span>
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
