import { motion } from 'motion/react';

import { groupsInOrder } from '@/lib/data';
import { useConfigurator } from '@/store/configurator/useConfigurator';

import { useQuote } from './lib/useQuote';
import { OptionGroup } from './OptionGroup';
import { PanelHeader } from './PanelHeader';
import { PriceBreakdown } from './PriceBreakdown';

/**
 * Name and price on top, then the numbered option sections and the price
 * breakdown, which scroll. Below the scene on a phone, a column on the right
 * from lg up.
 */
export const Panel: React.FC = () => {
  const catalog = useConfigurator((state) => state.catalog);
  const selection = useConfigurator((state) => state.selection);
  const select = useConfigurator((state) => state.select);
  const quote = useQuote(selection);

  if (!catalog || !selection) return null;

  return (
    <section
      aria-labelledby="panel-title"
      className="flex min-h-0 flex-1 flex-col bg-background lg:w-100 lg:flex-none lg:border-l"
    >
      <PanelHeader productName={catalog.product.name} quote={quote} />

      {/* layoutScroll: the selection marks slide inside this scrolling area,
          so Motion has to count its scroll position when it measures them. */}
      <motion.div layoutScroll className="flex-1 overflow-y-auto px-6">
        {groupsInOrder(catalog).map((group, index) => (
          <OptionGroup
            key={group.key}
            number={String(index + 1).padStart(2, '0')}
            group={group}
            options={catalog.options.filter((o) => o.groupKey === group.key)}
            selectedKey={selection[group.key]}
            blocked={quote?.blocked ?? []}
            currency={catalog.currency}
            onSelect={(optionKey) => select(group.key, optionKey)}
          />
        ))}

        {quote && <PriceBreakdown quote={quote} />}
      </motion.div>
    </section>
  );
};
