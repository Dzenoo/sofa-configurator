import { DOCK } from '@/ui/content/dock';
import type { Option } from '@/lib/data';
import { formatMoney } from '@/ui/utils/money';

/**
 * The price shown on an option. A group where every option costs something
 * (the layouts) carries the base price, so it shows as is ("€999"); elsewhere
 * it is a surcharge ("+€90", "+€60 / seat"), and free options show nothing.
 */
export function priceHint(
  option: Option,
  group: Option[],
  currency: string,
): string {
  if (option.priceCents === 0) return '';
  const amount = formatMoney(option.priceCents, currency);
  const text = group.every((o) => o.priceCents > 0) ? amount : `+${amount}`;
  return option.pricing === 'perSeat' ? `${text} ${DOCK.perSeat}` : text;
}
