import { useConfigurator } from '@/store/configurator/useConfigurator';
import { useQuote } from '@/store/configurator/useQuote';

import { Dimensions } from './Dimensions';
import { Price } from './Price';
import { ResetViewButton } from './ResetViewButton';
import { ShareButton } from './ShareButton';

/**
 * What the sofa is and what it costs on the left, what can be done with the
 * view and the link on the right. It lies over the scene, so only its own
 * controls take the pointer: the space between them still turns the sofa.
 */
export const TopBar: React.FC = () => {
  const catalog = useConfigurator((state) => state.catalog);
  const selection = useConfigurator((state) => state.selection);
  const quote = useQuote(selection);

  if (!catalog || !selection) return null;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 lg:p-8">
      <div className="pointer-events-auto flex flex-col gap-1">
        <h1 className="font-heading text-4xl leading-none lg:text-6xl">
          {catalog.product.name}
        </h1>
        {/* Fixed height, so nothing below jumps when the first price arrives. */}
        <div className="mt-1 h-9">{quote && <Price quote={quote} />}</div>
        <Dimensions />
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <ResetViewButton />
        <ShareButton catalog={catalog} selection={selection} />
      </div>
    </header>
  );
};
