import { SILHOUETTE_BOX, type SilhouettePart } from '../utils/silhouettes';

/** Centimeters; the gap left between two parts and the rounding of their corners. */
const DRAWING = { gap: 3, radius: 5 };

interface Props {
  parts: SilhouettePart[];
  /** Size and color: the drawing fills its box and uses the text color. */
  className?: string;
}

/** A layout drawn from above: backs and arms darker, cushions lighter. */
export const Silhouette: React.FC<Props> = ({ parts, className }) => (
  <svg
    aria-hidden
    viewBox={`0 0 ${SILHOUETTE_BOX.width} ${SILHOUETTE_BOX.height}`}
    className={className}
  >
    {parts.map((part, i) => (
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
);
