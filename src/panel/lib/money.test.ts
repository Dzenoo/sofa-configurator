import { describe, expect, it } from 'vitest';

import { getCatalog } from '@/lib/data';

import { formatMoney, priceHint } from './money';

const catalog = await getCatalog();
const group = (key: string) =>
  catalog.options.filter((o) => o.groupKey === key);
const option = (key: string) => catalog.options.find((o) => o.key === key)!;

describe('formatMoney()', () => {
  it('drops the cents on whole amounts and keeps them otherwise', () => {
    expect(formatMoney(152900, 'EUR')).toBe('€1,529');
    expect(formatMoney(152950, 'EUR')).toBe('€1,529.50');
  });
});

describe('priceHint()', () => {
  it('shows layouts as a full price', () => {
    expect(priceHint(option('l3'), group('layout'), 'EUR')).toBe('€999');
  });

  it('shows other options as a surcharge, per seat where it is per seat', () => {
    expect(priceHint(option('lw'), group('legs'), 'EUR')).toBe('+€90');
    expect(priceHint(option('fb1'), group('fabric'), 'EUR')).toBe(
      '+€60 / seat',
    );
  });

  it('shows nothing for free options', () => {
    expect(priceHint(option('lo'), group('legs'), 'EUR')).toBe('');
  });
});
