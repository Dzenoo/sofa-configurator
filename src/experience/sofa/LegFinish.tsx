import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import {
  MathUtils,
  RepeatWrapping,
  SRGBColorSpace,
  type MeshStandardMaterial,
} from 'three';

/**
 * Wood maps (ambientCG, CC0), 512 × 256 px, tiling.
 * - grain: the wood's own color map made neutral gray, so it only carries the
 *   pattern and the catalog color (oak, walnut) tints it cleanly.
 * - normal: the fine relief of the grain.
 */
const WOOD_MAPS = {
  grain: '/textures/wood/wood_grain.webp',
  normal: '/textures/wood/wood_normal.jpg',
};

const WOOD = {
  /** Times the pattern repeats around a leg and along it. */
  repeat: [1.5, 1.3] as [number, number],
  /** Radians; the maps' grain runs sideways, so a quarter turn sends it along the leg. */
  turn: MathUtils.degToRad(90),
  /** Depth of the grain's relief (normal scale). */
  relief: 4,
  /** 0–1; a satin, oiled finish rather than a lacquered one. */
  roughness: 0.5,
};

const METAL = {
  /** 1 is bare metal; lower would read as painted or coated. */
  metalness: 1,
  /** 0–1; low, for sharp reflections of the light panels. */
  roughness: 0.3,
  /**
   * How strongly the legs reflect the studio. A metal only shows its
   * surroundings tinted by its own color, and this one is almost black, so
   * at the usual 1 nearly nothing comes back and the legs go flat black.
   */
  reflections: 6,
};

interface Props {
  /** The model's wood material, shared by every wooden leg. */
  wood: MeshStandardMaterial;
  /** The model's metal material, shared by every metal leg. */
  metal: MeshStandardMaterial;
}

/**
 * What the legs are made of. Wood gets its grain: one pattern for both
 * tones, colored by the catalog, so oak still fades into walnut. Metal has
 * no pattern to show; what makes it read as metal is how it reflects the
 * studio's panels.
 */
export const LegFinish: React.FC<Props> = ({ wood, metal }) => {
  const maps = useTexture(WOOD_MAPS);
  const invalidate = useThree((state) => state.invalidate);

  // Once: the wood.
  useLayoutEffect(() => {
    maps.grain.colorSpace = SRGBColorSpace; // a color map, unlike the normal map
    for (const map of Object.values(maps)) {
      map.wrapS = map.wrapT = RepeatWrapping;
      map.flipY = false; // the model's UVs start at the top left, like every glTF
      map.center.set(0.5, 0.5); // turn around the middle
      map.repeat.set(...WOOD.repeat);
      map.rotation = WOOD.turn;
      map.needsUpdate = true;
    }
    // A material that gets its first maps compiles its shader again; that
    // happens once, behind the loading screen.
    wood.map = maps.grain;
    wood.normalMap = maps.normal;
    // Y is flipped, as GLTFLoader does for models without tangents.
    wood.normalScale.set(WOOD.relief, -WOOD.relief);
    wood.roughness = WOOD.roughness;
    wood.needsUpdate = true;
    invalidate();
  }, [maps, wood, invalidate]);

  useLayoutEffect(() => {
    metal.metalness = METAL.metalness;
    metal.roughness = METAL.roughness;
    metal.envMapIntensity = METAL.reflections;
    invalidate();
  }, [metal, invalidate]);

  return null;
};
