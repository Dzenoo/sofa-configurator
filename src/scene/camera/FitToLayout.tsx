import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Box3, MathUtils, Spherical, Vector3 } from 'three';

import { useView } from '@/store/view/useView';

/** Meters and radians; closer than this to the goal counts as arrived. */
const ARRIVED = 0.001;
/** Seconds; longest frame step used for the motion, so the first on-demand frame can't jump. */
const MAX_STEP = 1 / 30;

/** The part of the orbit controls this component uses (R3F only types them as an event dispatcher). */
interface Controls {
  target: Vector3;
  minDistance: number;
  maxDistance: number;
  addEventListener: (type: 'start', listener: () => void) => void;
  removeEventListener: (type: 'start', listener: () => void) => void;
}

interface Props {
  /** Root node of the layout on screen, e.g. "layout_l3". */
  layout: string;
  /** Degrees; the start angle around the sofa (0 = straight from the front, positive = from the right). */
  azimuth: number;
  /** Degrees; the start angle above the floor. */
  elevation: number;
  /** Free space around the fitted sofa: 1 = touching the edges of the view. */
  margin: number;
  /** Closest zoom, as a share of the distance that fits the sofa. */
  zoomMin: number;
  /** Farthest zoom, as a share of the distance that fits the sofa. */
  zoomMax: number;
  /** Speed of a framing move, per second: higher arrives sooner. */
  damping: number;
}

const box = new Box3();
const size3 = new Vector3();
const offset = new Vector3();
const step = new Vector3();
const spherical = new Spherical();

/**
 * Keeps the sofa framed, and the point the camera orbits around on the sofa's
 * center. A new layout (or a resized canvas) keeps the angle the visitor chose
 * and only moves in or out until it fits; "Reset view" also goes back to the
 * start angle. The very first view is set at once, with no move.
 *
 * A drag or a zoom takes over angle and distance right away, but the orbit
 * point still finishes its way to the center, so orbiting is never off-center.
 *
 * It measures only the layout's own node: the model holds all four layouts,
 * and a bounding box counts hidden objects too. The layout node includes its
 * ottoman, so turning the ottoman on or off never moves the camera.
 */
export const FitToLayout: React.FC<Props> = ({
  layout,
  azimuth,
  elevation,
  margin,
  zoomMin,
  zoomMax,
  damping,
}) => {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const controls = useThree((state) => state.controls) as Controls | null;
  const resets = useView((state) => state.resets);
  const handledResets = useRef(resets);

  // Changes every frame during a move, so it is a plain object, not state.
  const move = useRef({
    framed: false,
    center: new Vector3(),
    distance: 0,
    /** The orbit point is still on its way to the center. */
    centering: false,
    /** The distance is still on its way to the fitted one. */
    zooming: false,
    /** The angle is still on its way to the start angle. */
    turning: false,
  });

  /** Zoom limits follow the fitted distance; they also let the current distance through, so nothing snaps. */
  const limitZoom = (current: number) => {
    if (!controls) return;
    const { distance } = move.current;
    controls.minDistance = Math.min(distance * zoomMin, current);
    controls.maxDistance = Math.max(distance * zoomMax, current);
  };

  useLayoutEffect(() => {
    const node = scene.getObjectByName(layout);
    if (!node || !controls || !('fov' in camera)) return;
    const state = move.current;

    node.updateWorldMatrix(true, true);
    box.setFromObject(node);
    box.getCenter(state.center);
    box.getSize(size3);
    // The same fit drei's Bounds uses: the largest side has to fit the
    // narrower of the view's height and width.
    const largest = Math.max(size3.x, size3.y, size3.z);
    const fitHeight = largest / (2 * Math.atan((Math.PI * camera.fov) / 360));
    state.distance = margin * Math.max(fitHeight, fitHeight / camera.aspect);

    const reset = handledResets.current !== resets;
    handledResets.current = resets;

    if (!state.framed) {
      state.framed = true;
      controls.target.copy(state.center);
      spherical.set(
        state.distance,
        MathUtils.degToRad(90 - elevation),
        MathUtils.degToRad(azimuth),
      );
      camera.position.setFromSpherical(spherical).add(state.center);
      camera.lookAt(state.center);
      limitZoom(state.distance);
    } else {
      state.centering = true;
      state.zooming = true;
      state.turning = reset;
      // The limits are for the visitor, not for the move: open while it runs.
      controls.minDistance = 0;
      controls.maxDistance = Infinity;
    }
    invalidate();
  }, [
    layout,
    size,
    resets,
    controls,
    camera,
    scene,
    azimuth,
    elevation,
    margin,
    zoomMin,
    zoomMax,
    invalidate,
  ]);

  // A drag or a zoom takes over angle and distance; the orbit point keeps centering.
  useEffect(() => {
    if (!controls) return;
    const takeOver = () => {
      const state = move.current;
      state.zooming = false;
      state.turning = false;
      limitZoom(camera.position.distanceTo(controls.target));
    };
    controls.addEventListener('start', takeOver);
    return () => controls.removeEventListener('start', takeOver);
  }, [controls, camera, zoomMin, zoomMax]);

  useFrame((_, delta) => {
    const state = move.current;
    if (!controls || !(state.centering || state.zooming || state.turning))
      return;
    // Share of the remaining way covered this frame, the same at any frame rate.
    const share = 1 - Math.exp(-damping * Math.min(delta, MAX_STEP));

    if (state.centering) {
      // Camera and orbit point slide together, so centering never turns the view.
      step.subVectors(state.center, controls.target);
      if (step.length() < ARRIVED) state.centering = false;
      else step.multiplyScalar(share);
      controls.target.add(step);
      camera.position.add(step);
    }

    spherical.setFromVector3(
      offset.subVectors(camera.position, controls.target),
    );
    if (state.zooming) {
      const left = state.distance - spherical.radius;
      if (Math.abs(left) < ARRIVED) state.zooming = false;
      spherical.radius += state.zooming ? left * share : left;
    }
    if (state.turning) {
      const up = MathUtils.degToRad(90 - elevation) - spherical.phi;
      // The short way around, whichever side the camera is on.
      const around =
        MathUtils.euclideanModulo(
          MathUtils.degToRad(azimuth) - spherical.theta + Math.PI,
          Math.PI * 2,
        ) - Math.PI;
      if (Math.abs(up) < ARRIVED && Math.abs(around) < ARRIVED)
        state.turning = false;
      spherical.phi += state.turning ? up * share : up;
      spherical.theta += state.turning ? around * share : around;
    }
    camera.position.setFromSpherical(spherical).add(controls.target);
    camera.lookAt(controls.target);

    if (state.centering || state.zooming || state.turning) invalidate();
    else limitZoom(spherical.radius);
  });

  return null;
};
