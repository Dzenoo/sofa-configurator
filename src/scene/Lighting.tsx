import { ContactShadows, Environment } from '@react-three/drei';

const ENVIRONMENT = {
  /** Interior HDRI (ambientCG, CC0): 1K, RGB half float, DWAA. Light and reflections only, never shown. */
  url: '/environment/indoor.exr',
  /** Strength of the room light. */
  intensity: 1.2,
  /** Radians; the room turned a quarter around the sofa so the window light falls from the side. */
  rotation: [0, Math.PI / 2, 0] as [number, number, number],
};

const SHADOW = {
  /**
   * Meters; 1 mm below the floor and centered on the world origin, on purpose.
   * drei blurs the shadow by rendering a helper plane that always sits at
   * y = 0 with the shadow's own up-looking camera: the camera has to be below
   * that plane (and centered on it), or the blur renders nothing and the
   * shadow comes out empty.
   */
  position: [0, -0.001, 0] as [number, number, number],
  /** Meters; covers the largest layout (corner, 2.75 × 1.95 m) and the ottoman, with room to fade out. */
  scale: 6,
  /** Pixels of the shadow texture: plenty once it is blurred. */
  resolution: 512,
  /** How dark the shadow is, 0–1. */
  opacity: 0.5,
  /** Softness of the shadow edge (drei's blur units). */
  blur: 2.5,
  /** Meters above the floor that still cast a shadow: about the sofa's height (0.82 m). */
  far: 0.8,
};

/**
 * All the light in the scene: the room (HDRI) and one soft shadow on the
 * floor. No lights with shadow maps: cheap, and it reads as a real room.
 */
export const Lighting: React.FC = () => {
  return (
    <>
      <Environment
        files={ENVIRONMENT.url}
        environmentIntensity={ENVIRONMENT.intensity}
        environmentRotation={ENVIRONMENT.rotation}
      />
      <ContactShadows
        position={SHADOW.position}
        scale={SHADOW.scale}
        resolution={SHADOW.resolution}
        opacity={SHADOW.opacity}
        blur={SHADOW.blur}
        far={SHADOW.far}
      />
    </>
  );
};
