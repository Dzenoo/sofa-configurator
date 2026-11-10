import { PANEL } from '@/content/panel';
import type { Quote } from '@/lib/data';

import { formatMoney } from './lib/money';

interface Props {
  productName: string;
  /** Null until the first quote arrives. */
  quote: Quote | null;
}

/**
 * Name and price, always in view at the top of the panel while the options
 * scroll under it. The price is a polite live region read as a whole, so a
 * screen reader announces "Total €1,314" after each change.
 */
export const PanelHeader: React.FC<Props> = ({ productName, quote }) => (
  <header className="shrink-0 border-b px-6 pt-5 pb-4 lg:pt-8 lg:pb-6">
    <h1
      id="panel-title"
      className="font-heading text-4xl leading-none lg:text-5xl"
    >
      {productName}
    </h1>
    {/* Fixed height, so the header doesn't jump when the first price arrives. */}
    <p
      aria-live="polite"
      aria-atomic
      className="mt-2 h-8 text-2xl font-semibold tabular-nums lg:mt-3"
    >
      <span className="sr-only">{PANEL.total} </span>
      {quote && formatMoney(quote.totalCents, quote.currency)}
    </p>
  </header>
);
