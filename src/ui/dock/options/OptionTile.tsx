import { Radio } from '@base-ui/react/radio';
import { Lock } from 'lucide-react';

import type { Option } from '@/lib/data';

import { SelectionMark } from './SelectionMark';

/** What every kind of option (text tile, swatch, layout outline) is given. */
export interface OptionProps {
  option: Option;
  /** Price text under the name, or empty. */
  hint: string;
  blocked: boolean;
  selected: boolean;
  /** Id of the group's selection mark, the same for all its options. */
  markId: string;
  /** Id of the text that explains why the option is locked. */
  describedBy: string | undefined;
}

/**
 * A choice with nothing to show but its name. Like every option, the whole
 * tile is the radio button (a native button): a big touch target that reads
 * as "radio, checked" to screen readers and moves with the arrow keys.
 */
export const OptionTile: React.FC<OptionProps> = ({
  option,
  hint,
  blocked,
  selected,
  markId,
  describedBy,
}) => (
  <Radio.Root
    value={option.key}
    disabled={blocked}
    nativeButton
    render={<button type="button" />}
    aria-describedby={describedBy}
    className="relative flex min-h-14 w-full flex-col items-start justify-center gap-1 rounded-2xl border bg-background px-4 py-2.5 text-left text-sm whitespace-nowrap transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-background"
  >
    {selected && (
      <SelectionMark id={markId} className="-inset-px rounded-2xl border-2" />
    )}
    <span className="flex items-center gap-2">
      <span className="font-medium">{option.name}</span>
      {blocked && (
        <Lock aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      )}
    </span>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </Radio.Root>
);
