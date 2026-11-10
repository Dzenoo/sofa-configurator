import { create } from 'zustand';

/*
 * What the HTML over the scene asks of the 3D camera. The button and the
 * camera never import each other: both only know this store.
 */

interface ViewState {
  /** Counts "Reset view" presses; the camera reacts to every change. */
  resets: number;
  resetView: () => void;
}

export const useView = create<ViewState>()((set) => ({
  resets: 0,
  resetView: () => set((state) => ({ resets: state.resets + 1 })),
}));
