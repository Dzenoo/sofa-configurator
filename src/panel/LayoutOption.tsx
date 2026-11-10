import { Radio } from '@base-ui/react/radio';

import { SILHOUETTE_BOX, type SilhouettePart } from './lib/silhouettes';
import type { OptionProps } from './OptionTile';

/** Centimeters; the gap left between two parts and the rounding of their corners. */
const DRAWING = { gap: 3, radius: 5 };

interface Props extends OptionProps {
  silhouette: SilhouettePart[];
}

/** A layout, shown as its outline from above with the name and price under it. */
export const LayoutOption: React.FC<Props> = ({
  option,
  hint,
  blocked,
  describedBy,
  silhouette,
}) => (
  <Radio.Root
    value={option.key}
    disabled={blocked}
    nativeButton
    render={<button type="button" />}
    aria-describedby={describedBy}
    className="group flex flex-col rounded-lg border bg-background p-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:border-primary data-checked:ring-1 data-checked:ring-primary data-disabled:cursor-not-allowed data-disabled:opacity-50"
  >
    <svg
      aria-hidden
      viewBox={`0 0 ${SILHOUETTE_BOX.width} ${SILHOUETTE_BOX.height}`}
      className="mb-3 w-full text-muted-foreground transition-colors group-data-checked:text-primary"
    >
      {silhouette.map((part, i) => (
        <rect
          key={i}
          x={part.x + DRAWING.gap / 2}
          y={part.y + DRAWING.gap / 2}
          width={part.width - DRAWING.gap}
          height={part.height - DRAWING.gap}
          rx={DRAWING.radius}
          fill="currentColor"
          fillOpacity={part.kind === 'frame' ? 0.75 : 0.3}
        />
      ))}
    </svg>
    <span className="font-medium">{option.name}</span>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </Radio.Root>
);
