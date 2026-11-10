import { RotateCcw } from 'lucide-react';

import { SCENE_TEXT } from '@/content/scene';
import { useView } from '@/store/view/useView';

/** Back to the start angle, framed. Sits on the scene's corner, away from the sofa. */
export const ResetViewButton: React.FC = () => {
  const resetView = useView((state) => state.resetView);

  return (
    <button
      type="button"
      onClick={resetView}
      className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <RotateCcw aria-hidden className="size-4" />
      {SCENE_TEXT.resetView}
    </button>
  );
};
