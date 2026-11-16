import { OrbitControls } from '@react-three/drei';
import { MathUtils } from 'three';

import { FitToLayout } from './FitToLayout';
import { useIdleTurn } from './utils/useIdleTurn';

const VIEW = {
  /** Degrees; start angle around the sofa, positive = from the right. */
  azimuth: 30,
  /** Degrees; start angle above the floor. */
  elevation: 17,
  /** Free space around the fitted sofa: 1 = touching the edges of the view. */
  margin: 1.2,
  /** Closest zoom, as a share of the fitted distance. */
  zoomMin: 0.55,
  /** Farthest zoom, as a share of the fitted distance. */
  zoomMax: 1.6,
  /** Radians from straight above: the top view stays a little tilted (15°). */
  minPolarAngle: MathUtils.degToRad(15),
  /** Radians from straight above: down to 8° over the floor, never under the sofa. */
  maxPolarAngle: MathUtils.degToRad(90 - 8),
  /** Speed of a framing move, per second: most of the way in about a second, then a soft settle. */
  damping: 2.5,
};

/** How the sofa feels in the hand: heavy and smooth, like a real object on a turntable. */
const FEEL = {
  /** How long the sofa keeps gliding after a drag ends: lower glides longer (OrbitControls' damping factor). */
  glide: 0.04,
  /** How far a drag turns the sofa; below 1 feels heavier. */
  turnSpeed: 0.6,
  /** How far one step of the wheel or a pinch zooms. */
  zoomSpeed: 0.6,
  /** Speed of the slow turn while nobody touches the view; 1 is a full turn in about a minute. */
  idleSpeed: 0.35,
  /** Milliseconds after the last touch before that turn comes back. */
  idlePauseMs: 4000,
};

interface Props {
  layout: string;
}

/**
 * Orbit, zoom and framing. No panning: the sofa always stays the center of
 * the view, so it can't be dragged out of the frame. Left alone, it turns
 * slowly, like a piece on display.
 */
export const Camera: React.FC<Props> = ({ layout }) => {
  const idle = useIdleTurn(layout, FEEL.idlePauseMs);

  return (
    <>
      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={VIEW.minPolarAngle}
        maxPolarAngle={VIEW.maxPolarAngle}
        dampingFactor={FEEL.glide}
        rotateSpeed={FEEL.turnSpeed}
        zoomSpeed={FEEL.zoomSpeed}
        autoRotate={idle}
        autoRotateSpeed={FEEL.idleSpeed}
      />
      <FitToLayout
        layout={layout}
        azimuth={VIEW.azimuth}
        elevation={VIEW.elevation}
        margin={VIEW.margin}
        zoomMin={VIEW.zoomMin}
        zoomMax={VIEW.zoomMax}
        damping={VIEW.damping}
      />
    </>
  );
};
