import { Environment, Lightformer } from '@react-three/drei';
import { MathUtils, Vector3 } from 'three';

const STUDIO = {
  /** Meters; how far the panels stand from the sofa. Only their direction and size matter to the light. */
  distance: 6,
  /** Pixels of one face of the environment cube: the panels are soft, so small is enough. */
  resolution: 256,
  /** Brightness of the studio's walls (0–1): light from everywhere; more of it flattens the sofa. */
  ambient: 0.25,
  /** Meters above the floor the side panels aim at: the middle of the sofa. */
  aim: [0, 0.4, 0] as [number, number, number],
};

/** The main softbox, front left and above, and the directional light that comes from the same side. */
const KEY = {
  intensity: 4,
  /** Degrees around the sofa; negative is from the left. */
  azimuth: -50,
  /** Degrees above the floor. */
  elevation: 40,
  /** Meters, width and height; a bigger panel is a softer light. */
  size: [5, 3.5, 1] as [number, number, number],
  /** Intensity of the directional light: this is what gives the boxy shapes a light and a dark side. */
  direct: 1.5,
};
/** Softbox on the other side, lower: lifts the dark side so it never goes black. */
const FILL = {
  intensity: 1,
  azimuth: KEY.azimuth + 120,
  elevation: 20,
  size: [5, 4, 1] as [number, number, number],
};
/** Panel overhead: lights the seats and the tops. */
const TOP = {
  intensity: 2,
  size: [6, 6, 1] as [number, number, number],
};
/** A long, low panel behind the sofa, opposite the key: a bright line along the back edges. */
const RIM = {
  intensity: 2,
  azimuth: KEY.azimuth + 180,
  elevation: 25,
  size: [8, 1.5, 1] as [number, number, number],
};

/** A point around the sofa: degrees around it (0 = front, positive = right) and above the floor. */
const around = (azimuth: number, elevation: number) =>
  new Vector3().setFromSphericalCoords(
    STUDIO.distance,
    MathUtils.degToRad(90 - elevation),
    MathUtils.degToRad(azimuth),
  );

const KEY_POSITION = around(KEY.azimuth, KEY.elevation);
const FILL_POSITION = around(FILL.azimuth, FILL.elevation);
const RIM_POSITION = around(RIM.azimuth, RIM.elevation);
const TOP_POSITION: [number, number, number] = [0, STUDIO.distance, 0];

/**
 * A photo studio built in code instead of a photographed room: soft light
 * panels around the sofa, like softboxes on a furniture shoot, and one
 * directional light from the key's side. Nothing here casts a shadow map;
 * the floor shadow is its own thing.
 */
export const Studio: React.FC = () => (
  <>
    {/* frames={1}: the panels never move, so the environment is drawn once. */}
    <Environment resolution={STUDIO.resolution} frames={1}>
      <color
        attach="background"
        args={[STUDIO.ambient, STUDIO.ambient, STUDIO.ambient]}
      />
      <Lightformer
        form="rect"
        intensity={KEY.intensity}
        position={KEY_POSITION}
        scale={KEY.size}
        target={STUDIO.aim}
      />
      <Lightformer
        form="rect"
        intensity={FILL.intensity}
        position={FILL_POSITION}
        scale={FILL.size}
        target={STUDIO.aim}
      />
      <Lightformer
        form="rect"
        intensity={TOP.intensity}
        position={TOP_POSITION}
        scale={TOP.size}
        target
      />
      <Lightformer
        form="rect"
        intensity={RIM.intensity}
        position={RIM_POSITION}
        scale={RIM.size}
        target={STUDIO.aim}
      />
    </Environment>
    <directionalLight position={KEY_POSITION} intensity={KEY.direct} />
  </>
);
