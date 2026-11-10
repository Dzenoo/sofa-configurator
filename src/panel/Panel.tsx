import { groupsInOrder } from '@/lib/data';
import { useConfigurator } from '@/store/configurator/useConfigurator';

import { useQuote } from './lib/useQuote';
import { OptionGroup } from './OptionGroup';
import { PriceBreakdown } from './PriceBreakdown';
import { PriceTotal } from './PriceTotal';

/**
 * The options and the price. The options scroll; the total stays pinned at
 * the bottom. Below the scene on a phone, a column on the right from lg up.
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
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h1 id="panel-title" className="font-heading text-4xl">
          {catalog.product.name}
        </h1>

        <div className="mt-6 flex flex-col gap-7">
          {groupsInOrder(catalog).map((group) => (
            <OptionGroup
              key={group.key}
              group={group}
              options={catalog.options.filter((o) => o.groupKey === group.key)}
              selectedKey={selection[group.key]}
              blocked={quote?.blocked ?? []}
              currency={catalog.currency}
              onSelect={(optionKey) => select(group.key, optionKey)}
            />
          ))}
        </div>

        {quote && <PriceBreakdown quote={quote} />}
      </div>

      {quote && <PriceTotal quote={quote} />}
    </section>
  );
};
