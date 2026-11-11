import type { Catalog, Selection, Weave } from '@/lib/data';

/**
 * Everything the 3D sofa needs to draw a selection, and nothing about prices:
 * which model nodes to show and which colors to put on the shared materials.
 */
export interface SofaLook {
  /** Root node of the layout to show, e.g. "layout_l3". */
  layout: string;
  /** Name prefix of the leg meshes to show, e.g. "legs_wood". */
  legs: string;
  legsColor: string;
  fabricColor: string;
  /** Which weave texture the fabric uses. */
  weave: Weave;
  ottoman: boolean;
}

export function toLook(catalog: Catalog, selection: Selection): SofaLook {
  const meta = (key: string) => {
    const option = catalog.options.find((o) => o.key === key);
    if (!option) throw new Error(`Unknown option "${key}"`);
    return option.meta;
  };
  const layout = meta(selection.layout);
  const fabric = meta(selection.fabric);
  const legs = meta(selection.legs);

  return {
    layout: need(layout.node, 'layout node'),
    legs: need(legs.node, 'legs node'),
    legsColor: need(legs.color, 'legs color'),
    fabricColor: need(fabric.color, 'fabric color'),
    weave: need(fabric.texture, 'fabric weave'),
    // The ottoman option that shows one is the one pointing at a model node.
    ottoman: meta(selection.ottoman).node !== undefined,
  };
}

/** The schema already guarantees these fields; this only gives TypeScript (and a broken catalog) a clear message. */
function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Catalog is missing the ${what}`);
  return value;
}
