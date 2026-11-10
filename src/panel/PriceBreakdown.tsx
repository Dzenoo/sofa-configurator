import { PANEL } from '@/content/panel';
import type { Quote } from '@/lib/data';

import { formatMoney } from './lib/money';

interface Props {
  quote: Quote;
}

/** Every line of the quote and the sum under them, so the total is never a mystery. */
export const PriceBreakdown: React.FC<Props> = ({ quote }) => (
  <section className="border-t py-6">
    <div className="mb-4 flex items-baseline gap-3">
      {/* Empty number column, so the heading lines up with the numbered ones. */}
      <span aria-hidden className="w-5 shrink-0" />
      <h2 className="text-base font-medium">{PANEL.breakdown}</h2>
    </div>
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
      <div className="mt-2 flex justify-between gap-4 border-t pt-3 font-medium">
        <dt>{PANEL.total}</dt>
        <dd className="shrink-0 tabular-nums">
          {formatMoney(quote.totalCents, quote.currency)}
        </dd>
      </div>
    </dl>
  </section>
);
