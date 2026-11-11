import { RadioGroup } from '@base-ui/react/radio-group';
import { cn } from 'cn';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useId } from 'react';

import type { BlockedOption, OptionGroup, Option } from '@/lib/data';

import { LayoutOption } from './options/LayoutOption';
import { priceHint } from './utils/priceHint';
import { silhouetteOf } from './utils/silhouettes';
import { OptionTile } from './options/OptionTile';
import { SwatchOption } from './options/SwatchOption';

/**
 * The tray rises as one piece, then its options arrive one after another.
 * Seconds; quick, so opening a tray by hover never feels like waiting.
 */
const TRAY = {
  hidden: { opacity: 0, y: 12 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, staggerChildren: 0.045, delayChildren: 0.05 },
  },
  gone: { opacity: 0, y: 8, transition: { duration: 0.12 } },
};
const ITEM = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface Props {
  /** Id the dock button points at (aria-controls). */
  id: string;
  group: OptionGroup;
  options: Option[];
  selectedKey: string;
  /** Locked options of the whole selection; this group picks its own. */
  blocked: BlockedOption[];
  currency: string;
  onSelect: (optionKey: string) => void;
}

/** The options of one group, above the dock. Each kind of option keeps its own width, so names stay on one line. */
export const Tray: React.FC<Props> = ({
  id,
  group,
  options,
  selectedKey,
  blocked,
  currency,
  onSelect,
}) => {
  const ownId = useId();
  const labelId = `${ownId}-label`;
  const reasonId = `${ownId}-reason`;

  const lockedHere = blocked.filter((b) =>
    options.some((o) => o.key === b.optionKey),
  );
  const reasons = [...new Set(lockedHere.map((b) => b.reason))];
  const swatches = options.every((o) => o.meta.color);

  return (
    <motion.div
      id={id}
      variants={TRAY}
      initial="hidden"
      animate="shown"
      exit="gone"
      className="w-max max-w-[calc(100vw-2rem)] rounded-3xl border bg-background p-4 shadow-xl"
    >
      <h2 id={labelId} className="sr-only">
        {group.name}
      </h2>
      <RadioGroup
        aria-labelledby={labelId}
        value={selectedKey}
        onValueChange={(value) => onSelect(value as string)}
        className="flex flex-wrap justify-center gap-2"
      >
        {options.map((option) => {
          const locked = lockedHere.some((b) => b.optionKey === option.key);
          const props = {
            option,
            hint: priceHint(option, options, currency),
            blocked: locked,
            selected: option.key === selectedKey,
            markId: `${ownId}-mark`,
            describedBy: locked ? reasonId : undefined,
          };
          // What an option looks like follows from its data: an outline if
          // the layout has one, a swatch if it has a color, a tile otherwise.
          const silhouette =
            option.groupKey === 'layout'
              ? silhouetteOf(option.meta.node)
              : undefined;
          const color = swatches ? option.meta.color : undefined;
          return (
            <motion.div
              key={option.key}
              variants={ITEM}
              className={cn(silhouette ? 'w-32' : color ? 'w-24' : 'w-36')}
            >
              {silhouette ? (
                <LayoutOption {...props} silhouette={silhouette} />
              ) : color ? (
                <SwatchOption {...props} color={color} />
              ) : (
                <OptionTile {...props} />
              )}
            </motion.div>
          );
        })}
      </RadioGroup>

      {reasons.length > 0 && (
        <motion.p
          id={reasonId}
          variants={ITEM}
          className="mt-3 flex items-start justify-center gap-1.5 text-xs text-muted-foreground"
        >
          <Lock aria-hidden className="mt-px size-3.5 shrink-0" />
          {reasons.join(' ')}
        </motion.p>
      )}
    </motion.div>
  );
};
