/** Text the visitor reads over the 3D scene, kept out of the components. */
export const SCENE_TEXT = {
  resetView: 'Reset view',
  /** What the two numbers are, small above them. */
  dimensionsLabel: 'Width × depth',
  dimensions: (widthCm: number, depthCm: number) =>
    `${widthCm} × ${depthCm} cm`,
};
