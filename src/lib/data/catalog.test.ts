import { describe, expect, it } from 'vitest';

import rawCatalog from '@/data/catalog.json';

import { getCatalog, quote } from './index';
import { catalogSchema } from './schema';

/** A deep copy of the real catalog to break on purpose. */
const broken = (change: (c: typeof rawCatalog) => void) => {
  const copy = structuredClone(rawCatalog);
  change(copy);
  return catalogSchema.safeParse(copy);
};

describe('catalog.json', () => {
  it('passes the schema', () => {
    const result = catalogSchema.safeParse(rawCatalog);
    expect(result.error?.issues).toBeUndefined();
  });

  it('loads through getCatalog() and prices through quote()', async () => {
    const catalog = await getCatalog();
    const defaults = Object.fromEntries(
      catalog.groups.map((g) => [g.key, g.defaultKey]),
    );
    const result = await quote(defaults as Parameters<typeof quote>[0]);
    expect(result.totalCents).toBeGreaterThan(0);
  });
});

describe('the schema catches catalog mistakes', () => {
  it.each([
    [
      'a duplicate option key',
      (c: typeof rawCatalog) => c.options.push({ ...c.options[0]! }),
    ],
    [
      'a price in euros instead of cents',
      (c: typeof rawCatalog) => (c.options[0]!.priceCents = 799.5),
    ],
    [
      'a negative price',
      (c: typeof rawCatalog) => (c.options[0]!.priceCents = -1),
    ],
    [
      'a key that would break the link',
      (c: typeof rawCatalog) => (c.options[0]!.key = 'l.3'),
    ],
    [
      'a default from another group',
      (c: typeof rawCatalog) => (c.groups[0]!.defaultKey = 'fb1'),
    ],
    ['a missing group', (c: typeof rawCatalog) => c.groups.pop()],
    [
      'a rule to an unknown option',
      (c: typeof rawCatalog) => (c.rules[0]!.excludesKey = 'zz9'),
    ],
    [
      'a rule inside one group',
      (c: typeof rawCatalog) => (c.rules[0]!.excludesKey = 'fa2'),
    ],
    [
      'defaults that break a rule',
      (c: typeof rawCatalog) =>
        c.rules.push({ optionKey: 'l3', excludesKey: 'fb1', reason: 'x' }),
    ],
    [
      'a layout without seats',
      (c: typeof rawCatalog) =>
        delete (c.options[0]!.meta as { seats?: number }).seats,
    ],
    [
      'an unknown field',
      (c: typeof rawCatalog) => Object.assign(c.product, { colour: 'red' }),
    ],
  ])('%s', (_, change) => {
    expect(broken(change).success).toBe(false);
  });
});
