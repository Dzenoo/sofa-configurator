import { describe, expect, it } from 'vitest';

import rawCatalog from '@/data/catalog.json';
import { defaultSelection } from '@/lib/pricing';

import {
  decodeSelection,
  encodeSelection,
  selectionFromSearch,
  shareUrl,
} from './link';
import { catalogSchema } from './schema';
import type { Selection } from './types';

const catalog = catalogSchema.parse(rawCatalog);
const defaults = defaultSelection(catalog);

describe('share link', () => {
  it('writes the keys in panel order', () => {
    const selection: Selection = {
      layout: 'l3',
      fabric: 'fb2',
      legs: 'lo',
      cushions: 'cs',
      ottoman: 't1',
    };
    expect(encodeSelection(catalog, selection)).toBe('l3.fb2.lo.cs.t1');
  });

  it('reads back exactly what it wrote, for every option', () => {
    for (const option of catalog.options) {
      const selection = decodeSelection(catalog, `${option.key}`);
      expect(
        decodeSelection(catalog, encodeSelection(catalog, selection)),
      ).toEqual(selection);
    }
  });

  it('opens with the defaults when there is no config', () => {
    expect(decodeSelection(catalog, null)).toEqual(defaults);
    expect(decodeSelection(catalog, '')).toEqual(defaults);
    expect(selectionFromSearch(catalog, '')).toEqual(defaults);
  });

  it('replaces an unknown option with the default and keeps the rest', () => {
    expect(decodeSelection(catalog, 'l2.zz9.lm.cs.t1')).toEqual({
      ...defaults,
      layout: 'l2',
      legs: 'lm',
      ottoman: 't1',
    });
  });

  it('replaces a blocked option instead of breaking the page', () => {
    // Linen Light excludes soft cushions: the earlier group (fabric) wins.
    expect(decodeSelection(catalog, 'l3.fa1.lo.cm.t0')).toEqual({
      ...defaults,
      fabric: 'fa1',
      cushions: 'cs',
    });
  });

  it('survives junk', () => {
    for (const junk of [
      '....',
      '%%%',
      'l3.l2.l2',
      ' L2 . FC1 ',
      'a'.repeat(5000),
    ]) {
      expect(() => decodeSelection(catalog, junk)).not.toThrow();
    }
    expect(decodeSelection(catalog, 'l3.l2')).toMatchObject({ layout: 'l3' }); // first key per group wins
    expect(decodeSelection(catalog, ' L2 . FC1 ')).toMatchObject({
      layout: 'l2',
      fabric: 'fc1',
    });
  });

  it('does not care about key order', () => {
    expect(decodeSelection(catalog, 't1.cs.lo.fb2.l3')).toEqual(
      decodeSelection(catalog, 'l3.fb2.lo.cs.t1'),
    );
  });

  it('builds a copyable URL that opens the same selection', () => {
    const selection: Selection = { ...defaults, layout: 'll', fabric: 'fc2' };
    const url = shareUrl(
      catalog,
      selection,
      'https://example.com/?config=l2#top',
    );
    expect(url).toBe('https://example.com/?config=ll.fc2.lo.cs.t0');
    expect(selectionFromSearch(catalog, new URL(url).search)).toEqual(
      selection,
    );
  });
});
