import { Bounds, OrbitControls } from '@react-three/drei';
import { MathUtils } from 'three';

import { FitToLayout } from './FitToLayout';

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
  /** Seconds a framing move takes; drei eases it out, so most of it is a soft settle. */
  duration: 2,
};

interface Props {
  layout: string;
}

/**
 * Orbit, zoom and framing. No panning: the sofa always stays the center of
 * the view, so it can't be dragged out of the frame.
 */
export const Camera: React.FC<Props> = ({ layout }) => (
  <>
    <OrbitControls
      makeDefault
      enablePan={false}
      minPolarAngle={VIEW.minPolarAngle}
      maxPolarAngle={VIEW.maxPolarAngle}
    />
    <Bounds margin={VIEW.margin} maxDuration={VIEW.duration}>
      <FitToLayout
        layout={layout}
        azimuth={VIEW.azimuth}
        elevation={VIEW.elevation}
        zoomMin={VIEW.zoomMin}
        zoomMax={VIEW.zoomMax}
      />
    </Bounds>
  </>
);
