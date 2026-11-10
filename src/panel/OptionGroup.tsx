import { RadioGroup } from '@base-ui/react/radio-group';
import { Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useId } from 'react';

import type { BlockedOption, OptionGroup as Group, Option } from '@/lib/data';

import { LayoutOption } from './LayoutOption';
import { priceHint } from './lib/money';
import { silhouetteOf } from './lib/silhouettes';
import { OptionTile } from './OptionTile';
import { SwatchOption } from './SwatchOption';

/** Seconds; the lock reason fades in and out instead of popping. */
const REASON_FADE = { duration: 0.2 };

interface Props {
  /** Section number in the panel, "01", "02"… */
  number: string;
  group: Group;
  options: Option[];
  selectedKey: string;
  /** Locked options of the whole selection; this group picks its own. */
  blocked: BlockedOption[];
  currency: string;
  onSelect: (optionKey: string) => void;
}

export const OptionGroup: React.FC<Props> = ({
  number,
  group,
  options,
  selectedKey,
  blocked,
  currency,
  onSelect,
}) => {
  const id = useId();
  const labelId = `${id}-label`;
  const reasonId = `${id}-reason`;

  const selected = options.find((o) => o.key === selectedKey);
  const lockedHere = blocked.filter((b) =>
    options.some((o) => o.key === b.optionKey),
  );
  const reasons = [...new Set(lockedHere.map((b) => b.reason))];
  const swatches = options.every((o) => o.meta.color);

  return (
    <section className="border-t py-6 first:border-t-0">
      <div className="mb-4 flex items-baseline gap-3">
        {/* The number only orders the page visually; the heading carries the meaning. */}
        <span
          aria-hidden
          className="w-5 shrink-0 text-xs text-muted-foreground tabular-nums"
        >
          {number}
        </span>
        <h2 id={labelId} className="text-base font-medium">
          {group.name}
        </h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {selected?.name}
        </span>
      </div>

      <RadioGroup
        aria-labelledby={labelId}
        value={selectedKey}
        onValueChange={(value) => onSelect(value as string)}
        // Swatches are narrow, so three fit in a row with their names on one
        // line; tiles and outlines need the width of two columns.
        className={
          swatches ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-2 gap-2'
        }
      >
        {options.map((option) => {
          const locked = lockedHere.some((b) => b.optionKey === option.key);
          const props = {
            option,
            hint: priceHint(option, options, currency),
            blocked: locked,
            describedBy: locked ? reasonId : undefined,
          };
          // What an option looks like follows from its data, not its group:
          // an outline if the layout has one, a swatch if it has a color.
          const silhouette = silhouetteOf(option.meta.node);
          if (option.groupKey === 'layout' && silhouette) {
            return (
              <LayoutOption
                key={option.key}
                {...props}
                silhouette={silhouette}
              />
            );
          }
          if (swatches && option.meta.color) {
            return (
              <SwatchOption
                key={option.key}
                {...props}
                color={option.meta.color}
              />
            );
          }
          return <OptionTile key={option.key} {...props} />;
        })}
      </RadioGroup>

      <AnimatePresence initial={false}>
        {reasons.length > 0 && (
          <motion.p
            key="reason"
            id={reasonId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={REASON_FADE}
            className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground"
          >
            <Lock aria-hidden className="mt-px size-3.5 shrink-0" />
            {reasons.join(' ')}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
};
