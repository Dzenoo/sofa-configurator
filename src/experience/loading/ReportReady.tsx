import { useEffect } from 'react';

import { useLoading } from '@/store/loading/useLoading';

/**
 * Sits last inside the scene's Suspense, so it mounts only once everything
 * before it (light, sofa, camera) has loaded: its mounting is the signal.
 */
export const ReportReady: React.FC = () => {
  const setReady = useLoading((state) => state.setReady);
  useEffect(() => setReady(), [setReady]);
  return null;
};
