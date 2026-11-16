import {
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type BufferGeometry,
  type Object3D,
} from 'three';

/*
 * Names given in Blender (see the model notes). GLTFLoader strips dots from
 * names, so copies like "legs_wood.001" arrive as "legs_wood001": everything
 * below is matched by prefix, never by full name.
 */
const NAMES = {
  /** Root node of each layout: layout_l2, layout_l3, layout_ll, layout_lr. */
  layout: 'layout_',
  /** One ottoman group per layout, a direct child of it: ottoman_l2… */
  ottoman: 'ottoman',
  /** Every leg mesh, both variants: legs_wood…, legs_metal… */
  legs: 'legs_',
  fabricMaterial: 'M_fabric',
  woodMaterial: 'M_wood',
  metalMaterial: 'M_metal',
};

export interface SofaParts {
  layouts: Map<string, Object3D>;
  ottomans: Object3D[];
  legs: Mesh<BufferGeometry, MeshStandardMaterial>[];
  /** Shared by every fabric mesh, so one change recolors the whole sofa. */
  fabric: MeshPhysicalMaterial;
  /** Shared by every wooden leg; oak and walnut are this one material in two colors. */
  wood: MeshStandardMaterial;
  /** Shared by every metal leg. */
  metal: MeshStandardMaterial;
}

/** Finds, once, the nodes and materials that the selection switches. */
export function findSofaParts(scene: Object3D): SofaParts {
  const layouts = new Map(
    scene.children
      .filter((c) => c.name.startsWith(NAMES.layout))
      .map((c) => [c.name, c]),
  );
  const ottomans = [...layouts.values()].flatMap((layout) =>
    layout.children.filter((c) => c.name.startsWith(NAMES.ottoman)),
  );

  const legs: SofaParts['legs'] = [];
  let fabric: MeshPhysicalMaterial | undefined;
  let wood: MeshStandardMaterial | undefined;
  let metal: MeshStandardMaterial | undefined;
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    if (
      object.name.startsWith(NAMES.legs) &&
      object.material instanceof MeshStandardMaterial
    ) {
      legs.push(object as SofaParts['legs'][number]);
      if (object.material.name === NAMES.woodMaterial) wood = object.material;
      if (object.material.name === NAMES.metalMaterial) metal = object.material;
    }
    if (
      object.material instanceof MeshPhysicalMaterial &&
      object.material.name === NAMES.fabricMaterial
    ) {
      fabric = object.material;
    }
  });

  if (layouts.size === 0 || legs.length === 0 || !fabric || !wood || !metal) {
    throw new Error('sofa.glb is missing its layouts, legs or materials');
  }
  return { layouts, ottomans, legs, fabric, wood, metal };
}
