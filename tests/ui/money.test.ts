import { describe, expect, it } from 'vitest';

import { formatMoney } from '@/ui/utils/money';

describe('formatMoney()', () => {
  it('drops the cents on whole amounts and keeps them otherwise', () => {
    expect(formatMoney(152900, 'EUR')).toBe('€1,529');
    expect(formatMoney(152950, 'EUR')).toBe('€1,529.50');
  });
});
