import { useGLTF, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import { NoColorSpace } from 'three';

import { Assemble } from './Assemble';
import type { SofaLook } from './lib/look';
import { findSofaParts } from './lib/parts';

const MODEL = {
  url: '/models/sofa/sofa.glb',
  /** Ambient occlusion baked in Blender: one atlas for every fabric mesh. */
  aoUrl: '/models/sofa/ao.webp',
  /** The AO atlas uses the second UV set (TEXCOORD_1, loaded as "uv1"). */
  aoChannel: 1,
};

interface Props {
  look: SofaLook;
}

/**
 * The sofa from one .glb: a selection only shows and hides nodes and changes
 * values on materials that already exist, so a click never compiles a shader
 * or builds geometry.
 */
export const Sofa: React.FC<Props> = ({ look }) => {
  // Draco off (the model uses meshopt), meshopt on.
  const { scene } = useGLTF(MODEL.url, false, true);
  const ao = useTexture(MODEL.aoUrl);
  const parts = useMemo(() => findSofaParts(scene), [scene]);
  const invalidate = useThree((state) => state.invalidate);

  // Once: put the baked AO on the shared fabric material.
  useLayoutEffect(() => {
    ao.flipY = false; // glTF UVs start at the top left
    ao.colorSpace = NoColorSpace; // AO is data, not a color
    ao.channel = MODEL.aoChannel;
    ao.needsUpdate = true;
    parts.fabric.aoMap = ao;
    parts.fabric.needsUpdate = true;
    invalidate();
  }, [ao, parts, invalidate]);

  useLayoutEffect(() => {
    for (const [name, layout] of parts.layouts)
      layout.visible = name === look.layout;
    for (const ottoman of parts.ottomans) ottoman.visible = look.ottoman;
    for (const leg of parts.legs) leg.visible = leg.name.startsWith(look.legs);

    parts.fabric.color.set(look.fabricColor);
    // Oak and walnut share the wood material, so the color comes from the selection.
    parts.legs.find((leg) => leg.visible)?.material.color.set(look.legsColor);

    // The canvas only draws on demand: a changed selection is a reason to.
    invalidate();
  }, [look, parts, invalidate]);

  const layout = parts.layouts.get(look.layout);

  return (
    <>
      <primitive object={scene} />
      {layout && <Assemble layout={layout} />}
    </>
  );
};

useGLTF.preload(MODEL.url, false, true);
