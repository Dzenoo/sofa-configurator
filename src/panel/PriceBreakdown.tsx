import { PANEL } from '@/content/panel';
import type { Quote } from '@/lib/data';

import { formatMoney } from './lib/money';

interface Props {
  quote: Quote;
}

/** Every line of the quote, so the total is never a mystery. */
export const PriceBreakdown: React.FC<Props> = ({ quote }) => (
  <section className="mt-8 border-t pt-5">
    <h2 className="mb-3 text-sm font-medium">{PANEL.breakdown}</h2>
    <dl className="flex flex-col gap-2 text-sm">
      {quote.lines.map((line) => (
        <div key={line.key} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">
            {line.label}
            {/* The count only matters when it multiplies a price. */}
            {line.amountCents > 0 &&
              line.quantity > 1 &&
              ` ${PANEL.quantity(line.quantity)}`}
          </dt>
          <dd className="shrink-0 tabular-nums">
            {line.amountCents > 0
              ? formatMoney(line.amountCents, quote.currency)
              : PANEL.included}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);
