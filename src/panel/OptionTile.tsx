import { Radio } from '@base-ui/react/radio';
import { Lock } from 'lucide-react';

import type { Option } from '@/lib/data';

interface Props {
  option: Option;
  /** Price text under the name, or empty. */
  hint: string;
  blocked: boolean;
  /** Id of the text that explains why the option is locked. */
  describedBy: string | undefined;
}

/**
 * One choice. The whole tile is the radio button (a native button), so it is
 * a big touch target, reads as "radio, checked" to screen readers and moves
 * with the arrow keys inside its group.
 */
export const OptionTile: React.FC<Props> = ({
  option,
  hint,
  blocked,
  describedBy,
}) => (
  <Radio.Root
    value={option.key}
    disabled={blocked}
    nativeButton
    render={<button type="button" />}
    aria-describedby={describedBy}
    className="flex min-h-14 flex-col items-start justify-center gap-1 rounded-lg border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:border-primary data-checked:ring-1 data-checked:ring-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-background"
  >
    <span className="flex items-center gap-2">
      {option.meta.color && (
        // Every color also has its name next to it, never the swatch alone.
        <span
          aria-hidden
          className="size-4 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: option.meta.color }}
        />
      )}
      <span className="font-medium">{option.name}</span>
      {blocked && (
        <Lock aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      )}
    </span>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </Radio.Root>
);
