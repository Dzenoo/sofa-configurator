import { useEffect } from 'react';
import { DefaultLoadingManager } from 'three';

import { useLoading } from '@/store/loading/useLoading';

/**
 * Tells the loading screen how many of the scene's files have arrived. Every
 * three.js loader (model, textures, HDRI) reports to the default loading
 * manager, so this is the one place that sees them all.
 */
export const ReportProgress: React.FC = () => {
  const setProgress = useLoading((state) => state.setProgress);

  useEffect(() => {
    DefaultLoadingManager.onProgress = (_url, loaded, total) =>
      setProgress(loaded / total);
    return () => {
      DefaultLoadingManager.onProgress = () => {};
    };
  }, [setProgress]);

  return null;
};
