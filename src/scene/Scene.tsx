import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';

import { useConfigurator } from '@/store/configurator/useConfigurator';

import { toLook } from './lib/look';
import { Sofa } from './Sofa';

const SCENE = {
  /** Pixel ratio range: sharp on retina screens, capped so phones don't render 3× the pixels. */
  dpr: [1, 2] as [number, number],
  camera: {
    /** Meters; front-right of the sofa, a little above seat height. */
    position: [2.2, 1.4, 3.4] as const,
    /** Degrees; narrow, like a product photo, so the sofa doesn't look distorted. */
    fov: 35,
  },
  /** Meters; where the camera looks and orbits around: the middle of the seat. */
  target: [0, 0.4, 0.3] as const,
};

/*
 * Placeholder light so the model can be checked now. The real setup (interior
 * HDRI, contact shadow) is its own step and replaces this one.
 */
const LIGHT = {
  /** Sky and ground colors and intensity of the soft fill light. */
  hemisphere: { sky: '#ffffff', ground: '#b9b0a4', intensity: 1.2 },
  /** Key light from the front left, above; meters and intensity. */
  key: { position: [-2, 4, 3] as const, intensity: 2 },
};

export const Scene: React.FC = () => {
  const catalog = useConfigurator((state) => state.catalog);
  const selection = useConfigurator((state) => state.selection);
  const look = useMemo(
    () => (catalog && selection ? toLook(catalog, selection) : null),
    [catalog, selection],
  );
  if (!look) return null;

  return (
    // Drawing only on demand: a still sofa costs nothing, and the controls
    // and the sofa ask for a new frame when something actually changes.
    // The canvas is transparent: the page's --scene color shows through, so
    // the color is defined once and the area looks the same before 3D loads.
    <Canvas frameloop="demand" dpr={SCENE.dpr} camera={SCENE.camera}>
      <hemisphereLight
        args={[
          LIGHT.hemisphere.sky,
          LIGHT.hemisphere.ground,
          LIGHT.hemisphere.intensity,
        ]}
      />
      <directionalLight
        position={LIGHT.key.position}
        intensity={LIGHT.key.intensity}
      />

      <Suspense fallback={null}>
        <Sofa look={look} />
      </Suspense>
      <OrbitControls makeDefault target={SCENE.target} />
    </Canvas>
  );
};
