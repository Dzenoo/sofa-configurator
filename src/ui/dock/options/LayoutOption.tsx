import { Radio } from '@base-ui/react/radio';

import type { SilhouettePart } from '../utils/silhouettes';
import type { OptionProps } from './OptionTile';
import { SelectionMark } from './SelectionMark';
import { Silhouette } from './Silhouette';

interface Props extends OptionProps {
  silhouette: SilhouettePart[];
}

/** A layout, shown as its outline from above with the name and price under it. */
export const LayoutOption: React.FC<Props> = ({
  option,
  hint,
  blocked,
  selected,
  markId,
  describedBy,
  silhouette,
}) => (
  <Radio.Root
    value={option.key}
    disabled={blocked}
    nativeButton
    render={<button type="button" />}
    aria-describedby={describedBy}
    className="group relative flex w-full flex-col rounded-2xl border bg-background p-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:cursor-not-allowed data-disabled:opacity-50"
  >
    {selected && (
      <SelectionMark id={markId} className="-inset-px rounded-2xl border-2" />
    )}
    <Silhouette
      parts={silhouette}
      className="mb-3 w-full text-muted-foreground transition-[color,transform] duration-300 group-hover:scale-105 group-data-checked:text-primary"
    />
    <span className="font-medium whitespace-nowrap">{option.name}</span>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </Radio.Root>
);
