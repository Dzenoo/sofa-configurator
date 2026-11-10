import { groupsInOrder, resolveSelection } from '@/lib/pricing';

import type { Catalog, GroupKey, Selection } from './types';

/** The query parameter that carries a configuration: `/?config=l3.fb2.lo.cs.t1`. */
export const CONFIG_PARAM = 'config';

/** Option keys in panel order, joined with dots. */
export function encodeSelection(
  catalog: Catalog,
  selection: Selection,
): string {
  return groupsInOrder(catalog)
    .map((g) => selection[g.key])
    .join('.');
}

/**
 * Reads a link value back into a valid selection, whatever it contains. Order of
 * the keys doesn't matter; the first key per group wins; unknown keys are ignored;
 * missing or blocked options fall back to the defaults. Never throws on bad input.
 */
export function decodeSelection(
  catalog: Catalog,
  value: string | null | undefined,
): Selection {
  const groupOf = new Map(catalog.options.map((o) => [o.key, o.groupKey]));
  const input: Partial<Record<GroupKey, string>> = {};

  for (const token of (value ?? '').toLowerCase().split('.')) {
    const groupKey = groupOf.get(token.trim());
    if (groupKey && !(groupKey in input)) input[groupKey] = token.trim();
  }
  return resolveSelection(catalog, input);
}

/** Selection from a query string such as `window.location.search`. */
export function selectionFromSearch(
  catalog: Catalog,
  search: string,
): Selection {
  return decodeSelection(
    catalog,
    new URLSearchParams(search).get(CONFIG_PARAM),
  );
}

/** The same page URL with the selection written into it, ready to copy. */
export function shareUrl(
  catalog: Catalog,
  selection: Selection,
  pageUrl: string,
): string {
  const url = new URL(pageUrl);
  url.searchParams.set(CONFIG_PARAM, encodeSelection(catalog, selection));
  url.hash = '';
  return url.toString();
}
