import { cn } from 'cn';
import { motion } from 'motion/react';

/** A quick, soft slide with no bounce: it should feel like the mark follows the finger. */
const SLIDE = { type: 'spring', duration: 0.35, bounce: 0 } as const;

interface Props {
  /** Shared by the options of one group: the mark slides between them. */
  id: string;
  /** Shape and position over the option; the option itself must be `relative`. */
  className: string;
}

/**
 * The outline of the chosen option. Only the chosen option renders it, and
 * Motion moves it from the previous one (same layoutId) instead of letting
 * it blink off and on.
 */
export const SelectionMark: React.FC<Props> = ({ id, className }) => (
  <motion.span
    aria-hidden
    layoutId={id}
    transition={SLIDE}
    className={cn('pointer-events-none absolute border-primary', className)}
  />
);
