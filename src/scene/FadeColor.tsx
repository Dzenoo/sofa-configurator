import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { Color } from 'three';

/** Speed of the fade, per second: at 8 most of the change is done in about a third of a second. */
const SPEED = 8;
/** Largest difference in any channel (0–1, linear) that still counts as the same color. */
const SAME = 0.002;
/** Seconds; longest frame step, so the first on-demand frame can't jump most of the way. */
const MAX_STEP = 1 / 30;

interface Props {
  /** A material of the model; its own color is changed, nothing is replaced. */
  material: { color: Color };
  /** The color to show, as in the catalog ("#2f3a56"). */
  color: string;
}

/**
 * Brings a material to a color softly instead of switching it: a new fabric
 * or wood tone flows in. A material seen for the first time gets its color
 * at once, since there is nothing to fade from.
 */
export const FadeColor: React.FC<Props> = ({ material, color }) => {
  const invalidate = useThree((state) => state.invalidate);
  const goal = useRef(new Color());
  const fading = useRef(false);
  const shown = useRef<Props['material'] | null>(null);

  useLayoutEffect(() => {
    goal.current.set(color);
    if (shown.current === material) {
      fading.current = true;
    } else {
      shown.current = material;
      material.color.copy(goal.current);
    }
    // The canvas only draws on demand: a new color is a reason to.
    invalidate();
  }, [material, color, invalidate]);

  useFrame((_, delta) => {
    if (!fading.current) return;
    const { color: current } = material;
    current.lerp(
      goal.current,
      1 - Math.exp(-SPEED * Math.min(delta, MAX_STEP)),
    );

    const left = Math.max(
      Math.abs(current.r - goal.current.r),
      Math.abs(current.g - goal.current.g),
      Math.abs(current.b - goal.current.b),
    );
    if (left < SAME) {
      current.copy(goal.current);
      fading.current = false;
    }
    invalidate();
  });

  return null;
};
