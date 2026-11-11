import { Radio } from '@base-ui/react/radio';
import { Lock } from 'lucide-react';

import type { OptionProps } from './OptionTile';
import { SelectionMark } from './SelectionMark';

interface Props extends OptionProps {
  color: string;
}

/**
 * A color: a large swatch with its name and price under it, so the color
 * never stands alone. The ring around the swatch marks the chosen one, and
 * the swatch grows a little under the pointer.
 */
export const SwatchOption: React.FC<Props> = ({
  option,
  hint,
  blocked,
  selected,
  markId,
  describedBy,
  color,
}) => (
  <Radio.Root
    value={option.key}
    disabled={blocked}
    nativeButton
    render={<button type="button" />}
    aria-describedby={describedBy}
    className="group flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-center text-xs whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:cursor-not-allowed"
  >
    <span aria-hidden className="relative mb-2 size-12">
      <span
        className="block size-full rounded-full border border-black/10 transition-transform duration-300 group-hover:scale-110 group-data-disabled:scale-100 group-data-disabled:opacity-40"
        style={{ backgroundColor: color }}
      />
      {/* 2px off the swatch, 2px wide. */}
      {selected && (
        <SelectionMark id={markId} className="-inset-1 rounded-full border-2" />
      )}
    </span>
    <span className="flex items-center gap-1 font-medium group-data-disabled:text-muted-foreground">
      {option.name}
      {blocked && <Lock aria-hidden className="size-3 shrink-0" />}
    </span>
    {hint && <span className="text-muted-foreground">{hint}</span>}
  </Radio.Root>
);
