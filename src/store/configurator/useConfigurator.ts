import { create } from 'zustand';

import {
  getCatalog,
  selectionFromSearch,
  type Catalog,
  type GroupKey,
  type Selection,
} from '@/lib/data';
import { blockedOptions } from '@/lib/pricing';

/*
 * The one piece of state the UI and the 3D scene share: the current
 * selection. Everything else (price, locked options, what the scene shows) is
 * derived from it where it's needed, so it can never go out of sync.
 *
 * The catalog sits next to it because both sides need it to read the selection
 * (names, colors, model nodes), and because the store uses it to keep the
 * selection valid at all times.
 */

interface ConfiguratorState {
  /** Null until load() has finished. */
  catalog: Catalog | null;
  /** Null until load() has finished; always a valid selection after that. */
  selection: Selection | null;
  /** Loads the catalog and opens the configuration from the link (or the defaults). */
  load: () => Promise<void>;
  /** Picks an option. Ignores options that are unknown, from another group, or locked by a rule. */
  select: (groupKey: GroupKey, optionKey: string) => void;
}

export const useConfigurator = create<ConfiguratorState>()((set, get) => ({
  catalog: null,
  selection: null,

  load: async () => {
    if (get().catalog) return;
    const catalog = await getCatalog();
    set({
      catalog,
      selection: selectionFromSearch(catalog, window.location.search),
    });
  },

  select: (groupKey, optionKey) => {
    const { catalog, selection } = get();
    if (!catalog || !selection || selection[groupKey] === optionKey) return;

    const option = catalog.options.find((o) => o.key === optionKey);
    if (option?.groupKey !== groupKey) return;

    // The dock already shows locked options as disabled, with the reason.
    // This is the safety net, so no caller can put the store in a state the
    // rules forbid: only choices in the other groups can block this one.
    const others = Object.entries(selection)
      .filter(([key]) => key !== groupKey)
      .map(([, key]) => key);
    if (blockedOptions(catalog, others).some((b) => b.optionKey === optionKey))
      return;

    set({ selection: { ...selection, [groupKey]: optionKey } });
  },
}));
