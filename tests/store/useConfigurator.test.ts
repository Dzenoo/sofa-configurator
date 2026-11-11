import { beforeEach, describe, expect, it } from 'vitest';

import { getCatalog } from '@/lib/data';
import { defaultSelection } from '@/lib/pricing';

import { useConfigurator } from '@/store/configurator/useConfigurator';

const catalog = await getCatalog();
const defaults = defaultSelection(catalog);
const selection = () => useConfigurator.getState().selection;
const select = useConfigurator.getState().select;

describe('configurator store', () => {
  beforeEach(() => {
    useConfigurator.setState({ catalog, selection: defaults });
  });

  it('changes only the group that was picked', () => {
    select('fabric', 'fc1');
    expect(selection()).toEqual({ ...defaults, fabric: 'fc1' });
  });

  it('ignores an option locked by a rule', () => {
    select('cushions', 'cm');
    select('fabric', 'fa1'); // Linen Light is locked while soft cushions are on
    expect(selection()).toEqual({ ...defaults, cushions: 'cm' });
  });

  it('ignores unknown options and options from another group', () => {
    select('fabric', 'zz9');
    select('fabric', 'lo');
    expect(selection()).toEqual(defaults);
  });

  it('does nothing before the catalog has loaded', () => {
    useConfigurator.setState({ catalog: null, selection: null });
    select('fabric', 'fc1');
    expect(selection()).toBeNull();
  });
});
