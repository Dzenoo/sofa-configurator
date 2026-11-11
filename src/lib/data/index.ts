import rawCatalog from './catalog.json';
import { price } from '@/lib/pricing';

import { catalogSchema } from './schema';
import type { Catalog, Quote, Selection } from './types';

/*
 * The only door to the catalog and prices. Components call these two functions
 * and never read catalog.json themselves. Both are async on purpose: when a real
 * backend arrives, only their insides change (GET /catalog, POST /quotes) and no
 * call site does.
 */

let catalog: Promise<Catalog> | undefined;

/** Today: the bundled catalog.json, checked against the schema. Later: GET /catalog. */
export function getCatalog(): Promise<Catalog> {
  catalog ??= Promise.resolve().then(() => catalogSchema.parse(rawCatalog));
  return catalog;
}

/** Today: price() in the browser. Later: POST /quotes with the same selection. */
export async function quote(selection: Selection): Promise<Quote> {
  return price(await getCatalog(), selection);
}

// Pure helpers the UI needs to read a catalog, passed through so components
// keep a single door to the data.
export { defaultSelection, groupsInOrder } from '@/lib/pricing';
export {
  CONFIG_PARAM,
  decodeSelection,
  encodeSelection,
  selectionFromSearch,
  shareUrl,
} from './link';
export type * from './types';
