import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Vector3, type Object3D } from 'three';

import { useLoading } from '@/store/loading/useLoading';

/** Scale of a module that isn't there yet: as good as nothing, without a zero that breaks its matrices. */
const HIDDEN = 0.0001;
/** Seconds; longest frame step, so the first on-demand frame can't skip ahead. */
const MAX_STEP = 1 / 30;
/** Module names from Blender, in the order they arrive: what you sit on, then the arms, then the ottoman. */
const ORDER = ['corner', 'seat', 'arm', 'ottoman'];

const TIMING = {
  /** Seconds one module takes to settle. */
  duration: 0.8,
  /** Seconds between one module starting and the next. */
  stagger: 0.12,
  /** Meters above its place that a module starts from. */
  lift: 0.25,
};

/** Fast at first, then settling. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Piece {
  node: Object3D;
  /** Where and how big the module really is; it ends exactly here. */
  position: Vector3;
  scale: Vector3;
  /** Seconds after the start that this module begins. */
  delay: number;
}

interface Props {
  /** The layout on screen; its direct children are the modules. */
  layout: Object3D;
}

/**
 * The sofa's entrance: when the loading screen leaves, the modules settle
 * into place one after another, each growing out of nothing while it comes
 * down the last few centimeters. It shows what the product is: a sofa made
 * of modules. The floor shadow follows by itself, since it is drawn from
 * what is on screen. Visitors who asked for less motion get the sofa at once.
 */
export const Assemble: React.FC<Props> = ({ layout }) => {
  const done = useLoading((state) => state.done);
  const invalidate = useThree((state) => state.invalidate);
  const pieces = useRef<Piece[]>([]);
  const elapsed = useRef(0);
  const running = useRef(false);

  /** Puts every module where the animation has it at this moment. */
  const pose = () => {
    const { duration, lift } = TIMING;
    for (const piece of pieces.current) {
      const t = Math.min(
        Math.max((elapsed.current - piece.delay) / duration, 0),
        1,
      );
      const there = easeOut(t);
      piece.node.scale
        .copy(piece.scale)
        .multiplyScalar(Math.max(there, HIDDEN));
      piece.node.position.copy(piece.position);
      piece.node.position.y += (1 - there) * lift;
    }
    invalidate();
  };

  const start = () => {
    pieces.current.forEach((piece, i) => {
      piece.delay = i * TIMING.stagger;
    });
    elapsed.current = 0;
    running.current = true;
    pose();
  };

  // The modules of this layout, in arrival order, and where each belongs.
  useLayoutEffect(() => {
    const rank = (node: Object3D) =>
      ORDER.findIndex((name) => node.name.includes(name));
    pieces.current = [...layout.children]
      .sort(
        (a, b) =>
          rank(a) - rank(b) ||
          a.position.x - b.position.x ||
          a.position.z - b.position.z,
      )
      .map((node) => ({
        node,
        position: node.position.clone(),
        scale: node.scale.clone(),
        delay: 0,
      }));

    // Before the loading screen leaves there is no sofa yet.
    if (!useLoading.getState().done) pose();

    // A change of layout mid-way: leave the old one whole, as it really is.
    return () => {
      running.current = false;
      for (const piece of pieces.current) {
        piece.node.position.copy(piece.position);
        piece.node.scale.copy(piece.scale);
      }
    };
    // pose only reads refs.
  }, [layout]);

  useEffect(() => {
    if (!done) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elapsed.current = Infinity;
      pose();
    } else {
      start();
    }
    // start and pose only read refs.
  }, [done]);

  useFrame((_, delta) => {
    if (!running.current) return;
    elapsed.current += Math.min(delta, MAX_STEP);
    const last = pieces.current[pieces.current.length - 1];
    if (!last || elapsed.current >= last.delay + TIMING.duration) {
      elapsed.current = Infinity;
      running.current = false;
    }
    pose();
  });

  return null;
};
