import { create } from 'zustand';

/*
 * How far the 3D scene is with loading. The scene reports, the loading
 * screen (plain HTML, in the first chunk) reads: neither imports the other.
 */

interface LoadingState {
  /** 0–1; share of the scene's files (model, textures, HDRI) that have arrived. */
  progress: number;
  /** The scene has everything and is on screen behind the loading screen. */
  ready: boolean;
  /** The loading screen has started to leave: the moment the sofa may reveal itself. */
  done: boolean;
  setProgress: (progress: number) => void;
  setReady: () => void;
  finish: () => void;
}

export const useLoading = create<LoadingState>()((set) => ({
  progress: 0,
  ready: false,
  done: false,
  setProgress: (progress) => set({ progress }),
  setReady: () => set({ ready: true }),
  finish: () => set({ done: true }),
}));
