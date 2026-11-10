import { PANEL } from '@/content/panel';
import type { Quote } from '@/lib/data';

import { formatMoney } from './lib/money';

interface Props {
  quote: Quote;
}

/**
 * Always in view at the bottom of the panel. A polite live region read as a
 * whole, so a screen reader announces "Total €1,529" after each change.
 */
export const PriceTotal: React.FC<Props> = ({ quote }) => (
  <div
    aria-live="polite"
    aria-atomic
    className="flex items-baseline justify-between gap-4 border-t bg-background px-5 py-4"
  >
    <span className="text-sm font-medium">{PANEL.total}</span>
    <span className="text-2xl font-semibold tabular-nums">
      {formatMoney(quote.totalCents, quote.currency)}
    </span>
  </div>
);
