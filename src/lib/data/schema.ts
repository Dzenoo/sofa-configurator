import { z } from 'zod';

/** The fabric weaves the 3D scene has textures for (public/textures/<weave>/). */
export const WEAVES = ['linen', 'boucle', 'velvet'] as const;

/** The option groups the panel and the 3D scene know about, in no particular order (see `order`). */
export const GROUP_KEYS = [
  'layout',
  'fabric',
  'legs',
  'cushions',
  'ottoman',
] as const;

/** Short lowercase codes: they end up in share links (`?config=l3.fb2.lo.cs.t1`), so no dots. */
const key = z
  .string()
  .regex(/^[a-z][a-z0-9]{0,7}$/, 'must be a short lowercase code (a-z, 0-9)');

/** Money is always whole cents, never a float. */
const cents = z.number().int().nonnegative();

const productSchema = z.strictObject({
  slug: z.string().min(1),
  name: z.string().min(1),
  basePriceCents: cents,
});

const groupSchema = z.strictObject({
  key: z.enum(GROUP_KEYS),
  name: z.string().min(1),
  order: z.number().int(),
  defaultKey: key,
});

/** Ties an option to the 3D model and to pricing. Every field is optional; the refinements say which group needs what. */
const metaSchema = z.strictObject({
  /** Seats this option adds: layouts, and the ottoman (it takes fabric and a cushion like a seat). */
  seats: z.number().int().positive().optional(),
  /** Node (or node-name prefix) in sofa.glb that this option shows. */
  node: z.string().min(1).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
  /** Fabric quality group, shown in the price lines. */
  tier: z.string().min(1).optional(),
  /** Weave texture, shared by a tier. */
  texture: z.enum(WEAVES).optional(),
  /** Centimeters; outer width and depth of a layout, shown next to the sofa. */
  widthCm: z.number().int().positive().optional(),
  depthCm: z.number().int().positive().optional(),
});

const optionSchema = z.strictObject({
  key,
  groupKey: z.enum(GROUP_KEYS),
  name: z.string().min(1),
  priceCents: cents,
  pricing: z.enum(['fixed', 'perSeat']),
  meta: metaSchema,
});

/** "optionKey excludes excludesKey", in both directions. */
const ruleSchema = z.strictObject({
  optionKey: key,
  excludesKey: key,
  reason: z.string().min(1),
});

export const catalogSchema = z
  .strictObject({
    version: z.number().int().positive(),
    currency: z.literal('EUR'),
    product: productSchema,
    groups: z.array(groupSchema),
    options: z.array(optionSchema),
    rules: z.array(ruleSchema),
  })
  .superRefine((catalog, ctx) => {
    const issue = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: 'custom', message, path });

    for (const groupKey of GROUP_KEYS) {
      const count = catalog.groups.filter((g) => g.key === groupKey).length;
      if (count !== 1)
        issue(`group "${groupKey}" must appear exactly once, found ${count}`, [
          'groups',
        ]);
    }

    const byKey = new Map<string, (typeof catalog.options)[number]>();
    catalog.options.forEach((option, i) => {
      if (byKey.has(option.key))
        issue(`duplicate option key "${option.key}"`, ['options', i, 'key']);
      byKey.set(option.key, option);

      if (
        option.groupKey === 'layout' &&
        (!option.meta.seats ||
          !option.meta.node ||
          !option.meta.widthCm ||
          !option.meta.depthCm)
      ) {
        issue(
          `layout "${option.key}" needs meta.seats, node, widthCm and depthCm`,
          ['options', i, 'meta'],
        );
      }
      if (
        option.groupKey === 'legs' &&
        (!option.meta.node || !option.meta.color)
      ) {
        issue(`legs "${option.key}" need meta.node and meta.color`, [
          'options',
          i,
          'meta',
        ]);
      }
      if (
        option.groupKey === 'fabric' &&
        (!option.meta.color || !option.meta.tier || !option.meta.texture)
      ) {
        issue(`fabric "${option.key}" needs meta.color, tier and texture`, [
          'options',
          i,
          'meta',
        ]);
      }
    });

    catalog.groups.forEach((group, i) => {
      const fallback = byKey.get(group.defaultKey);
      if (fallback?.groupKey !== group.key) {
        issue(
          `default "${group.defaultKey}" is not an option of group "${group.key}"`,
          ['groups', i, 'defaultKey'],
        );
      }
    });

    const defaults = new Set(catalog.groups.map((g) => g.defaultKey));
    catalog.rules.forEach((rule, i) => {
      const a = byKey.get(rule.optionKey);
      const b = byKey.get(rule.excludesKey);
      if (!a)
        issue(`rule refers to unknown option "${rule.optionKey}"`, [
          'rules',
          i,
          'optionKey',
        ]);
      if (!b)
        issue(`rule refers to unknown option "${rule.excludesKey}"`, [
          'rules',
          i,
          'excludesKey',
        ]);
      if (a && b && a.groupKey === b.groupKey) {
        issue('a rule must connect options from two different groups', [
          'rules',
          i,
        ]);
      }
      if (defaults.has(rule.optionKey) && defaults.has(rule.excludesKey)) {
        issue('the default selection breaks this rule', ['rules', i]);
      }
    });
  });
