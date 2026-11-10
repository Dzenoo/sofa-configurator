import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { NeutralToneMapping } from 'three';

import { useConfigurator } from '@/store/configurator/useConfigurator';

import { Camera } from './Camera';
import { toLook } from './lib/look';
import { Lighting } from './Lighting';
import { ResetViewButton } from './ResetViewButton';
import { Sofa } from './Sofa';

const SCENE = {
  /** Pixel ratio range: sharp on retina screens, capped so phones don't render 3× the pixels. */
  dpr: [1, 2] as [number, number],
  camera: {
    /** Meters; only where the camera waits before the first framing move takes it to the start angle. */
    position: [2.2, 1.4, 3.4] as const,
    /** Degrees; narrow, like a product photo, so the sofa doesn't look distorted. */
    fov: 35,
  },
};

/*
 * Neutral tone mapping (Khronos PBR Neutral) instead of R3F's default ACES:
 * it keeps the catalog colors true (ACES shifts hues and darkens saturated
 * fabrics), which matters when the color on screen is what someone buys.
 */
const GL = { toneMapping: NeutralToneMapping };

export const Scene: React.FC = () => {
  const catalog = useConfigurator((state) => state.catalog);
  const selection = useConfigurator((state) => state.selection);
  const look = useMemo(
    () => (catalog && selection ? toLook(catalog, selection) : null),
    [catalog, selection],
  );
  if (!look) return null;

  return (
    <>
      {/* Drawing only on demand: a still sofa costs nothing, and the controls
          and the sofa ask for a new frame when something actually changes.
          The canvas is transparent: the page's --scene color shows through, so
          the color is defined once and the area looks the same before 3D loads. */}
      <Canvas frameloop="demand" dpr={SCENE.dpr} camera={SCENE.camera} gl={GL}>
        {/* Light, sofa and camera wait for each other: the sofa never shows
            unlit, and the camera frames it only once it exists. */}
        <Suspense fallback={null}>
          <Lighting />
          <Sofa look={look} />
          <Camera layout={look.layout} />
        </Suspense>
      </Canvas>
      <ResetViewButton />
    </>
  );
};
