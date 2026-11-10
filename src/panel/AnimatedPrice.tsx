import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { formatMoney } from './lib/money';

/** Seconds; long enough to see the number run, short enough not to wait for it. */
const COUNT = { duration: 0.5, ease: 'easeOut' } as const;
/** Cents; the running number moves in whole euros, so no decimals flicker past. */
const WHOLE = 100;

interface Props {
  cents: number;
  currency: string;
}

/**
 * A price that counts from the old amount to the new one. The text is
 * written straight to the element, not through React state: it changes on
 * every frame. Hidden from screen readers, which get the final price from
 * the live region next to it instead of every step.
 */
export const AnimatedPrice: React.FC<Props> = ({ cents, currency }) => {
  const element = useRef<HTMLSpanElement>(null);
  const shown = useRef(cents);
  const still = useReducedMotion();

  useEffect(() => {
    const write = (value: number) => {
      shown.current = value;
      if (element.current) {
        element.current.textContent = formatMoney(value, currency);
      }
    };
    if (still || shown.current === cents) return write(cents);

    const run = animate(shown.current, cents, {
      ...COUNT,
      onUpdate: (value) => write(Math.round(value / WHOLE) * WHOLE),
      onComplete: () => write(cents),
    });
    // A newer price starts from the number on screen, not from the old goal.
    return () => run.stop();
  }, [cents, currency, still]);

  return (
    <span ref={element} aria-hidden>
      {formatMoney(cents, currency)}
    </span>
  );
};
