import type {
  BlockedOption,
  Catalog,
  GroupKey,
  OptionGroup,
  Selection,
} from '@/lib/data/types';

/*
 * Pure functions over the catalog, no React, no browser: the same code can run
 * on a server later. Rules are data ("X excludes Y"), never ifs in here.
 */

export function groupsInOrder(catalog: Catalog): OptionGroup[] {
  return [...catalog.groups].sort((a, b) => a.order - b.order);
}

export function defaultSelection(catalog: Catalog): Selection {
  return Object.fromEntries(
    catalog.groups.map((g) => [g.key, g.defaultKey]),
  ) as Selection;
}

/** Options that can't be picked next to the given ones, with the reason to show. Rules work both ways. */
export function blockedOptions(
  catalog: Catalog,
  selected: Iterable<string>,
): BlockedOption[] {
  const chosen = new Set(selected);
  const blocked = new Map<string, BlockedOption>();
  const block = (optionKey: string, byKey: string, reason: string) => {
    if (!blocked.has(optionKey))
      blocked.set(optionKey, { optionKey, byKey, reason });
  };

  for (const rule of catalog.rules) {
    if (chosen.has(rule.optionKey))
      block(rule.excludesKey, rule.optionKey, rule.reason);
    if (chosen.has(rule.excludesKey))
      block(rule.optionKey, rule.excludesKey, rule.reason);
  }
  return [...blocked.values()];
}

/**
 * Turns any input (a parsed link, an old saved config) into a valid selection:
 * an unknown key, or one from the wrong group, falls back to the group's default;
 * an option blocked by an earlier group falls back to the default, or to the first
 * option that fits. Groups are settled in panel order, so earlier choices win.
 */
export function resolveSelection(
  catalog: Catalog,
  input: Partial<Record<GroupKey, string>>,
): Selection {
  const resolved: Partial<Record<GroupKey, string>> = {};

  for (const group of groupsInOrder(catalog)) {
    const options = catalog.options.filter((o) => o.groupKey === group.key);
    const blocked = new Set(
      blockedOptions(catalog, Object.values(resolved)).map((b) => b.optionKey),
    );
    const fits = (key: string | undefined): key is string =>
      key !== undefined &&
      !blocked.has(key) &&
      options.some((o) => o.key === key);

    const wanted = input[group.key];
    const pick = [wanted, group.defaultKey, ...options.map((o) => o.key)].find(
      fits,
    );
    if (!pick)
      throw new Error(`No option of group "${group.key}" fits the selection`);
    resolved[group.key] = pick;
  }
  return resolved as Selection;
}
