import { describe, expect, it } from 'vitest';

import rawCatalog from '@/data/catalog.json';
import { catalogSchema } from '@/lib/data/schema';
import type { Catalog, GroupKey, Option, Selection } from '@/lib/data/types';

import { price } from './price';
import {
  blockedOptions,
  defaultSelection,
  resolveSelection,
} from './selection';

const catalog: Catalog = catalogSchema.parse(rawCatalog);
const defaults = defaultSelection(catalog);
const optionsOf = (group: GroupKey) =>
  catalog.options.filter((o) => o.groupKey === group);
const option = (key: string) =>
  catalog.options.find((o) => o.key === key) as Option;
const pick = (changes: Partial<Selection>): Selection => ({
  ...defaults,
  ...changes,
});

/** Seats of a selection, read from the catalog the same way price() does. */
const seatsOf = (selection: Selection) =>
  Object.values(selection).reduce(
    (sum, key) => sum + (option(key).meta.seats ?? 0),
    0,
  );

describe('price()', () => {
  it('prices a shared-link example exactly (pins the formula)', () => {
    // 3-seater 999 + Bouclé (group B) 60 × 4 seats (3 + ottoman) + oak 0 + standard 0 + ottoman 290
    const quote = price(catalog, {
      layout: 'l3',
      fabric: 'fb2',
      legs: 'lo',
      cushions: 'cs',
      ottoman: 't1',
    });
    expect(quote.totalCents).toBe(99900 + 6000 * 4 + 29000);
    expect(quote.currency).toBe('EUR');
  });

  it.each(optionsOf('layout').map((o) => [o.name, o] as const))(
    'every layout: %s costs its own price with default options',
    (_, layout) => {
      const selection = pick({ layout: layout.key });
      const surcharges = Object.values(selection)
        .filter((key) => key !== layout.key)
        .reduce((sum, key) => {
          const o = option(key);
          return (
            sum +
            o.priceCents * (o.pricing === 'perSeat' ? seatsOf(selection) : 1)
          );
        }, 0);
      expect(price(catalog, selection).totalCents).toBe(
        layout.priceCents + surcharges,
      );
    },
  );

  const tiers = [...new Set(optionsOf('fabric').map((o) => o.meta.tier))];
  it.each(tiers)(
    'every fabric group: %s is charged per seat on every layout',
    (tier) => {
      const fabric = optionsOf('fabric').find(
        (o) => o.meta.tier === tier,
      ) as Option;
      for (const layout of optionsOf('layout')) {
        const selection = pick({
          layout: layout.key,
          fabric: fabric.key,
          cushions: 'cs',
        });
        const line = price(catalog, selection).lines.find(
          (l) => l.key === fabric.key,
        );
        expect(line).toMatchObject({
          quantity: layout.meta.seats,
          unitCents: fabric.priceCents,
          amountCents: fabric.priceCents * (layout.meta.seats ?? 0),
        });
      }
    },
  );

  it('counts the ottoman as a seat for fabric and cushions, and adds its fixed price', () => {
    const without = price(
      catalog,
      pick({ layout: 'l2', fabric: 'fc1', cushions: 'cm', ottoman: 't0' }),
    );
    const withIt = price(
      catalog,
      pick({ layout: 'l2', fabric: 'fc1', cushions: 'cm', ottoman: 't1' }),
    );
    expect(withIt.totalCents - without.totalCents).toBe(
      option('t1').priceCents +
        option('fc1').priceCents +
        option('cm').priceCents,
    );
  });

  it('charges legs once, whatever the layout', () => {
    for (const layout of optionsOf('layout')) {
      const line = price(
        catalog,
        pick({ layout: layout.key, legs: 'lw' }),
      ).lines.find((l) => l.key === 'lw');
      expect(line).toMatchObject({
        quantity: 1,
        amountCents: option('lw').priceCents,
      });
    }
  });

  it('keeps money in whole cents and the lines add up to the total', () => {
    for (const layout of optionsOf('layout')) {
      for (const fabric of optionsOf('fabric')) {
        const quote = price(
          catalog,
          pick({ layout: layout.key, fabric: fabric.key, ottoman: 't1' }),
        );
        expect(quote.lines.reduce((sum, l) => sum + l.amountCents, 0)).toBe(
          quote.totalCents,
        );
        for (const line of quote.lines)
          expect(Number.isInteger(line.amountCents)).toBe(true);
      }
    }
  });

  it('has one line per group, in panel order', () => {
    const quote = price(catalog, defaults);
    expect(quote.lines.map((l) => option(l.key).groupKey)).toEqual(
      [...catalog.groups].sort((a, b) => a.order - b.order).map((g) => g.key),
    );
  });

  it('throws on an option that is not in the catalog or in the wrong group', () => {
    expect(() => price(catalog, pick({ fabric: 'nope' }))).toThrow();
    expect(() => price(catalog, pick({ fabric: 'lo' }))).toThrow();
  });
});

describe('rules', () => {
  it.each(catalog.rules.map((r) => [r.optionKey, r.excludesKey, r] as const))(
    'every rule: %s blocks %s, and the other way round, with the reason',
    (a, b, rule) => {
      expect(blockedOptions(catalog, [a])).toContainEqual({
        optionKey: b,
        byKey: a,
        reason: rule.reason,
      });
      expect(blockedOptions(catalog, [b])).toContainEqual({
        optionKey: a,
        byKey: b,
        reason: rule.reason,
      });

      const groupOfA = option(a).groupKey;
      const groupOfB = option(b).groupKey;
      const quote = price(
        catalog,
        pick({ [groupOfA]: a } as Partial<Selection>),
      );
      expect(quote.blocked.map((x) => x.optionKey)).toContain(b);
      const both = { [groupOfA]: a, [groupOfB]: b } as Partial<Selection>;
      expect(resolveSelection(catalog, both)[groupOfB]).not.toBe(b);
    },
  );

  it('blocks nothing for the default selection', () => {
    expect(price(catalog, defaults).blocked).toEqual([]);
  });
});
