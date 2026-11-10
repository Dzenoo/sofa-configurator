import { PANEL } from '@/content/panel';
import type { Quote } from '@/lib/data';

import { AnimatedPrice } from './AnimatedPrice';
import { formatMoney } from './lib/money';

interface Props {
  productName: string;
  /** Null until the first quote arrives. */
  quote: Quote | null;
}

/**
 * Name and price, always in view at the top of the panel while the options
 * scroll under it.
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
    <p className="mt-2 h-8 text-2xl font-semibold tabular-nums lg:mt-3">
      {quote && (
        <AnimatedPrice cents={quote.totalCents} currency={quote.currency} />
      )}
      {/* What a screen reader hears: the final price once ("Total €1,314"),
          not every step of the count. Polite, and read as a whole. */}
      <span aria-live="polite" aria-atomic className="sr-only">
        {quote &&
          `${PANEL.total} ${formatMoney(quote.totalCents, quote.currency)}`}
      </span>
    </p>
  </header>
);
