/*
 * Top-down outlines of the layouts, drawn from the real module sizes so the
 * four tiles compare honestly: a corner sofa looks as much bigger as it is.
 * Back of the sofa is at the top, like looking at a floor plan.
 */

/** Centimeters; every outline is drawn inside this box (the corner sofa is 275 × 195). */
export const SILHOUETTE_BOX = { width: 280, height: 195 };

/** Centimeters, from the Blender model. */
const SIZE = {
  seatWidth: 80,
  depth: 95,
  backDepth: 22,
  armWidth: 20,
  cornerWidth: 95,
};

export interface SilhouettePart {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Cushions you sit on are drawn light, backs and arms darker. */
  kind: 'seat' | 'frame';
}

const part = (
  x: number,
  y: number,
  width: number,
  height: number,
  kind: SilhouettePart['kind'],
): SilhouettePart => ({ x, y, width, height, kind });

/** One seat module at x, y: back on top, cushion below. */
const seat = (x: number, y: number): SilhouettePart[] => [
  part(x, y, SIZE.seatWidth, SIZE.backDepth, 'frame'),
  part(
    x,
    y + SIZE.backDepth,
    SIZE.seatWidth,
    SIZE.depth - SIZE.backDepth,
    'seat',
  ),
];

function straight(seats: number): SilhouettePart[] {
  const width = seats * SIZE.seatWidth + 2 * SIZE.armWidth;
  const x = (SILHOUETTE_BOX.width - width) / 2;
  const y = (SILHOUETTE_BOX.height - SIZE.depth) / 2;
  return [
    part(x, y, SIZE.armWidth, SIZE.depth, 'frame'),
    ...Array.from({ length: seats }, (_, i) =>
      seat(x + SIZE.armWidth + i * SIZE.seatWidth, y),
    ).flat(),
    part(x + width - SIZE.armWidth, y, SIZE.armWidth, SIZE.depth, 'frame'),
  ];
}

function cornerLeft(): SilhouettePart[] {
  const width = SIZE.cornerWidth + 2 * SIZE.seatWidth + SIZE.armWidth;
  const x = (SILHOUETTE_BOX.width - width) / 2;
  const cushion = SIZE.cornerWidth - SIZE.backDepth;
  return [
    // Corner module: back along the top and down the left side.
    part(x, 0, SIZE.cornerWidth, SIZE.backDepth, 'frame'),
    part(x, SIZE.backDepth, SIZE.backDepth, cushion, 'frame'),
    part(x + SIZE.backDepth, SIZE.backDepth, cushion, cushion, 'seat'),
    ...seat(x + SIZE.cornerWidth, 0),
    ...seat(x + SIZE.cornerWidth + SIZE.seatWidth, 0),
    part(x + width - SIZE.armWidth, 0, SIZE.armWidth, SIZE.depth, 'frame'),
    // The seat in front of the corner, turned a quarter, and the arm that ends it.
    part(x, SIZE.depth, SIZE.backDepth, SIZE.seatWidth, 'frame'),
    part(x + SIZE.backDepth, SIZE.depth, cushion, SIZE.seatWidth, 'seat'),
    part(
      x,
      SIZE.depth + SIZE.seatWidth,
      SIZE.cornerWidth,
      SIZE.armWidth,
      'frame',
    ),
  ];
}

const mirrored = (parts: SilhouettePart[]): SilhouettePart[] =>
  parts.map((p) => ({ ...p, x: SILHOUETTE_BOX.width - p.x - p.width }));

/** Outlines by the layout's model node (the option's meta.node). */
const SILHOUETTES: Record<string, SilhouettePart[]> = {
  layout_l2: straight(2),
  layout_l3: straight(3),
  layout_ll: cornerLeft(),
  layout_lr: mirrored(cornerLeft()),
};

export function silhouetteOf(
  node: string | undefined,
): SilhouettePart[] | undefined {
  return node ? SILHOUETTES[node] : undefined;
}
