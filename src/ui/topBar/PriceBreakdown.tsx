import { TOP_BAR } from '@/ui/content/topBar';
import type { Quote } from '@/lib/data';
import { formatMoney } from '@/ui/utils/money';

interface Props {
  quote: Quote;
}

/** Every line of the quote and the sum under them, so the total is never a mystery. */
export const PriceBreakdown: React.FC<Props> = ({ quote }) => (
  <dl className="flex flex-col gap-2 text-sm">
    {quote.lines.map((line) => (
      <div key={line.key} className="flex justify-between gap-6">
        <dt className="text-muted-foreground">
          {line.label}
          {/* The count only matters when it multiplies a price. */}
          {line.amountCents > 0 &&
            line.quantity > 1 &&
            ` ${TOP_BAR.quantity(line.quantity)}`}
        </dt>
        <dd className="shrink-0 tabular-nums">
          {line.amountCents > 0
            ? formatMoney(line.amountCents, quote.currency)
            : TOP_BAR.included}
        </dd>
      </div>
    ))}
    <div className="mt-1 flex justify-between gap-6 border-t pt-3 font-medium">
      <dt>{TOP_BAR.total}</dt>
      <dd className="shrink-0 tabular-nums">
        {formatMoney(quote.totalCents, quote.currency)}
      </dd>
    </div>
  </dl>
);
