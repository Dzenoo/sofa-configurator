import { describe, expect, it } from 'vitest';

import { getCatalog } from '@/lib/data';
import { defaultSelection } from '@/lib/pricing';

import { toLook } from './look';

const catalog = await getCatalog();
const defaults = defaultSelection(catalog);

describe('toLook()', () => {
  it('maps a selection to model nodes and colors', () => {
    expect(
      toLook(catalog, {
        layout: 'll',
        fabric: 'fc1',
        legs: 'lm',
        cushions: 'cs',
        ottoman: 't1',
      }),
    ).toEqual({
      layout: 'layout_ll',
      legs: 'legs_metal',
      legsColor: '#1c1c1c',
      fabricColor: '#2f3a56',
      weave: 'velvet',
      ottoman: true,
    });
  });

  it('hides the ottoman for "no ottoman"', () => {
    expect(toLook(catalog, { ...defaults, ottoman: 't0' }).ottoman).toBe(false);
  });

  it('works for every option of every group', () => {
    for (const option of catalog.options) {
      expect(() =>
        toLook(catalog, { ...defaults, [option.groupKey]: option.key }),
      ).not.toThrow();
    }
  });
});
