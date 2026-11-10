import { Radio } from '@base-ui/react/radio';
import { Lock } from 'lucide-react';

import type { OptionProps } from './OptionTile';

interface Props extends OptionProps {
  color: string;
}

/**
 * A color: a large swatch with its name and price under it, so the color
 * never stands alone. The ring around the swatch marks the chosen one.
 */
export const SwatchOption: React.FC<Props> = ({
  option,
  hint,
  blocked,
  describedBy,
  color,
}) => (
  <Radio.Root
    value={option.key}
    disabled={blocked}
    nativeButton
    render={<button type="button" />}
    aria-describedby={describedBy}
    className="group flex flex-col items-center gap-0.5 rounded-lg py-1 text-center text-xs whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:cursor-not-allowed"
  >
    <span
      aria-hidden
      className="mb-1.5 size-12 rounded-full border border-black/10 ring-offset-2 ring-offset-background transition-shadow group-hover:ring-2 group-hover:ring-border group-data-checked:ring-2 group-data-checked:ring-primary group-data-disabled:opacity-40 group-data-disabled:group-hover:ring-0"
      style={{ backgroundColor: color }}
    />
    <span className="flex items-center gap-1 font-medium group-data-disabled:text-muted-foreground">
      {option.name}
      {blocked && <Lock aria-hidden className="size-3 shrink-0" />}
    </span>
    {hint && <span className="text-muted-foreground">{hint}</span>}
  </Radio.Root>
);
