import { useEffect } from 'react';

import {
  CONFIG_PARAM,
  defaultSelection,
  encodeSelection,
  shareUrl,
} from '@/lib/data';

import { useConfigurator } from './useConfigurator';

/**
 * Keeps the address bar in step with the selection, so the page can be
 * reloaded or its address copied at any moment and it opens the same sofa.
 * Mounted once, at the top of the app.
 *
 * It replaces the history entry instead of adding one: Back leaves the page,
 * it doesn't walk through every click. A first visit with the default sofa
 * keeps its clean address, without a ?config.
 */
export function useSelectionInUrl(): void {
  const catalog = useConfigurator((state) => state.catalog);
  const selection = useConfigurator((state) => state.selection);

  useEffect(() => {
    if (!catalog || !selection) return;
    const encoded = encodeSelection(catalog, selection);
    const inUrl = new URLSearchParams(window.location.search).get(CONFIG_PARAM);
    const isDefault =
      encoded === encodeSelection(catalog, defaultSelection(catalog));
    if (inUrl === encoded || (inUrl === null && isDefault)) return;

    window.history.replaceState(
      null,
      '',
      shareUrl(catalog, selection, window.location.href),
    );
  }, [catalog, selection]);
}
