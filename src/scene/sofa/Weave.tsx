import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { NoColorSpace, RepeatWrapping, type MeshPhysicalMaterial } from 'three';

import type { Weave as WeaveName } from '@/lib/data';

/** Normal maps of the three weaves (ambientCG, CC0), 1024 px, tiling. Only the relief is used; color comes from the catalog. */
const NORMAL_MAPS: Record<WeaveName, string> = {
  linen: '/textures/linen/linen_normal.jpg',
  boucle: '/textures/boucle/boucle_normal.jpg',
  velvet: '/textures/velvet/velvet_normal.jpg',
};

/**
 * What makes each weave read as itself.
 * - repeat: times the texture repeats per meter of fabric; higher is finer.
 * - relief: depth of the weave (normal scale).
 * - roughness: 0–1.
 * - sheen: 0–1; soft glow of the fibers at glancing angles. Never 0, so the
 *   shader never has to change between fabrics.
 * - sheenRoughness: 0–1; how wide that glow spreads.
 */
const WEAVES: Record<
  WeaveName,
  {
    repeat: number;
    relief: number;
    roughness: number;
    sheen: number;
    sheenRoughness: number;
  }
> = {
  linen: {
    repeat: 2.5,
    relief: 0.7,
    roughness: 1,
    sheen: 0.5,
    sheenRoughness: 0.7,
  },
  boucle: {
    repeat: 3,
    relief: 1.2,
    roughness: 1,
    sheen: 0.5,
    sheenRoughness: 0.7,
  },
  velvet: {
    repeat: 1,
    relief: 3,
    roughness: 0.75,
    sheen: 1,
    sheenRoughness: 0.3,
  },
};

/** Sharper weave at glancing angles, capped: more costs fill rate on phones and shows nothing. */
const MAX_ANISOTROPY = 8;

interface Props {
  /** The model's one fabric material. */
  material: MeshPhysicalMaterial;
  weave: WeaveName;
}

/**
 * Makes the fabric read as linen, bouclé or velvet: a tiling normal map for
 * the weave and its own roughness and sheen. All three maps load up front,
 * so changing fabric only swaps a texture and numbers on the material that
 * is already there, with no shader to compile.
 */
export const Weave: React.FC<Props> = ({ material, weave }) => {
  const maps = useTexture(NORMAL_MAPS);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  // Once: how the maps are read.
  useLayoutEffect(() => {
    const anisotropy = Math.min(
      MAX_ANISOTROPY,
      gl.capabilities.getMaxAnisotropy(),
    );
    for (const name of Object.keys(maps) as WeaveName[]) {
      const map = maps[name];
      map.wrapS = map.wrapT = RepeatWrapping;
      // The model's first UV set is in meters, so this is repeats per meter.
      map.repeat.setScalar(WEAVES[name].repeat);
      map.colorSpace = NoColorSpace; // a normal map is data, not a color
      map.flipY = false; // the model's UVs start at the top left, like every glTF
      map.anisotropy = anisotropy;
      map.needsUpdate = true;
    }
  }, [maps, gl]);

  useLayoutEffect(() => {
    const { relief, roughness, sheen, sheenRoughness } = WEAVES[weave];
    // First time only, a material that gets a normal map compiles its shader
    // again; that happens behind the loading screen.
    if (!material.normalMap) material.needsUpdate = true;
    material.normalMap = maps[weave];
    // Y is flipped, as GLTFLoader does for models without tangents.
    material.normalScale.set(relief, -relief);
    material.roughness = roughness;
    material.sheen = sheen;
    material.sheenRoughness = sheenRoughness;
    invalidate();
  }, [maps, weave, material, invalidate]);

  return null;
};
