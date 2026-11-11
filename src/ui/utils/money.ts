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
