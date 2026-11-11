import { RotateCcw } from 'lucide-react';

import { TOP_BAR } from '@/ui/content/topBar';
import { useView } from '@/store/view/useView';

/** Back to the start angle, framed. The icon turns back a little under the pointer, like the view will. */
export const ResetViewButton: React.FC = () => {
  const resetView = useView((state) => state.resetView);

  return (
    <button
      type="button"
      aria-label={TOP_BAR.resetView}
      title={TOP_BAR.resetView}
      onClick={resetView}
      className="group flex size-11 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <RotateCcw
        aria-hidden
        className="size-4 transition-transform duration-300 group-hover:-rotate-45"
      />
    </button>
  );
};
