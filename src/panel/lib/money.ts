import { PANEL } from '@/content/panel';
import type { Option } from '@/lib/data';

/** The site is in English; prices read "€1,529". */
const LOCALE = 'en';

const formatters = new Map<string, Intl.NumberFormat>();

/** Cents to a display price. Whole amounts drop the ",00", others keep two decimals. */
export function formatMoney(cents: number, currency: string): string {
  const digits = cents % 100 === 0 ? 0 : 2;
  const key = `${currency}:${digits}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(key, formatter);
  }
  return formatter.format(cents / 100);
}

/**
 * The price shown on an option tile. A group where every option costs
 * something (the layouts) carries the base price, so it shows as is ("€999");
 * elsewhere it is a surcharge ("+€90", "+€60 / seat"), and free options show nothing.
 */
export function priceHint(
  option: Option,
  group: Option[],
  currency: string,
): string {
  if (option.priceCents === 0) return '';
  const amount = formatMoney(option.priceCents, currency);
  const text = group.every((o) => o.priceCents > 0) ? amount : `+${amount}`;
  return option.pricing === 'perSeat' ? `${text} ${PANEL.perSeat}` : text;
}
