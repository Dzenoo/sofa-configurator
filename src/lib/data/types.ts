import type { z } from 'zod';

import type { GROUP_KEYS, catalogSchema } from './schema';

/*
 * Types are written once, as the Zod schema in ./schema.ts, and inferred here,
 * so the JSON check and the TypeScript types can never drift apart. Their shape
 * matches the future database tables: a backend only has to fill the same shapes.
 * No runtime code here, so pricing (and later the server) can import it freely.
 */

export type Catalog = z.infer<typeof catalogSchema>;
export type Product = Catalog['product'];
export type OptionGroup = Catalog['groups'][number];
export type Option = Catalog['options'][number];
export type Rule = Catalog['rules'][number];

export type GroupKey = (typeof GROUP_KEYS)[number];

/** One option key per group: exactly what goes into the share link. */
export type Selection = Readonly<Record<GroupKey, string>>;

export interface QuoteLine {
  /** Option key, or "base" for the product's base price. */
  key: string;
  label: string;
  quantity: number;
  unitCents: number;
  amountCents: number;
}

export interface BlockedOption {
  optionKey: string;
  /** The selected option that blocks it. */
  byKey: string;
  reason: string;
}

export interface Quote {
  totalCents: number;
  currency: Catalog['currency'];
  lines: QuoteLine[];
  blocked: BlockedOption[];
}
