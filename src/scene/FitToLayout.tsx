import { useBounds } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { MathUtils, Vector3 } from 'three';

import { useView } from '@/store/view/useView';

/** The part of the orbit controls this component sets (R3F only types them as an event dispatcher). */
interface ZoomLimits {
  minDistance: number;
  maxDistance: number;
}

interface Props {
  /** Root node of the layout on screen, e.g. "layout_l3". */
  layout: string;
  /** Degrees; the start angle around the sofa (0 = straight from the front, positive = from the right). */
  azimuth: number;
  /** Degrees; the start angle above the floor. */
  elevation: number;
  /** Closest zoom, as a share of the distance that fits the sofa. */
  zoomMin: number;
  /** Farthest zoom, as a share of the distance that fits the sofa. */
  zoomMax: number;
}

/**
 * Keeps the sofa framed. A new layout (or a resized canvas) keeps the angle
 * the visitor chose and only moves in or out until it fits; the first view
 * and "Reset view" also go back to the start angle. drei's Bounds animates
 * every move.
 *
 * It measures only the layout's own node: the model holds all four layouts,
 * and a bounding box counts hidden objects too. The layout node includes its
 * ottoman, so turning the ottoman on or off never moves the camera.
 */
export const FitToLayout: React.FC<Props> = ({
  layout,
  azimuth,
  elevation,
  zoomMin,
  zoomMax,
}) => {
  const bounds = useBounds();
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const controls = useThree((state) => state.controls) as ZoomLimits | null;
  const resets = useView((state) => state.resets);
  const framed = useRef(false);
  const handledResets = useRef(resets);

  useLayoutEffect(() => {
    const node = scene.getObjectByName(layout);
    if (!node || !controls) return;

    const { center, distance } = bounds.refresh(node).getSize();
    controls.minDistance = distance * zoomMin;
    controls.maxDistance = distance * zoomMax;

    const toStart = !framed.current || handledResets.current !== resets;
    framed.current = true;
    handledResets.current = resets;

    if (toStart) {
      const offset = new Vector3().setFromSphericalCoords(
        distance,
        MathUtils.degToRad(90 - elevation),
        MathUtils.degToRad(azimuth),
      );
      bounds.moveTo(center.clone().add(offset)).lookAt({ target: center });
    } else {
      bounds.reset();
    }
    // Bounds moves the camera on frames, and frames only run on demand.
    invalidate();
  }, [
    layout,
    size,
    resets,
    controls,
    azimuth,
    elevation,
    zoomMin,
    zoomMax,
    scene,
    bounds,
    invalidate,
  ]);

  return null;
};
