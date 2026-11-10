import type {
  Catalog,
  Option,
  Quote,
  QuoteLine,
  Selection,
} from '@/lib/data/types';

import { blockedOptions, groupsInOrder } from './selection';

/**
 * The whole price, computed from the catalog alone. Pure: no React, no browser,
 * so it can move to the server (POST /quotes) unchanged.
 *
 * - "fixed" options cost their price once.
 * - "perSeat" options cost their price times the seat count. Seats come from the
 *   options themselves (meta.seats): the layout, plus the ottoman, which is
 *   upholstered and cushioned like one more seat.
 *
 * Expects a resolved selection (see resolveSelection); an unknown key is a bug and throws.
 */
export function price(catalog: Catalog, selection: Selection): Quote {
  const byKey = new Map(catalog.options.map((o) => [o.key, o]));

  const chosen = groupsInOrder(catalog).map((group) => {
    const option = byKey.get(selection[group.key]);
    if (option?.groupKey !== group.key) {
      throw new Error(
        `"${selection[group.key]}" is not an option of group "${group.key}"`,
      );
    }
    return { group, option };
  });

  const seats = chosen.reduce(
    (sum, { option }) => sum + (option.meta.seats ?? 0),
    0,
  );

  const lines: QuoteLine[] = [];
  if (catalog.product.basePriceCents > 0) {
    lines.push({
      key: 'base',
      label: catalog.product.name,
      quantity: 1,
      unitCents: catalog.product.basePriceCents,
      amountCents: catalog.product.basePriceCents,
    });
  }
  for (const { group, option } of chosen) {
    const quantity = option.pricing === 'perSeat' ? seats : 1;
    lines.push({
      key: option.key,
      label: `${group.name}: ${label(option)}`,
      quantity,
      unitCents: option.priceCents,
      amountCents: option.priceCents * quantity,
    });
  }

  return {
    totalCents: lines.reduce((sum, line) => sum + line.amountCents, 0),
    currency: catalog.currency,
    lines,
    blocked: blockedOptions(catalog, Object.values(selection)),
  };
}

function label(option: Option): string {
  return option.meta.tier
    ? `${option.name} (group ${option.meta.tier})`
    : option.name;
}
