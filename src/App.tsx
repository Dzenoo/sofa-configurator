import { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'motion/react';

import { Dock } from '@/ui/dock/Dock';
import { Loader } from '@/ui/loader/Loader';
import { useConfigurator } from '@/store/configurator/useConfigurator';
import { useLoading } from '@/store/loading/useLoading';
import { useSelectionInUrl } from '@/store/configurator/useSelectionInUrl';
import { TopBar } from '@/ui/topBar/TopBar';

// three.js is most of the JavaScript, so the scene comes in its own chunk:
// the page and the loading screen show at once, the sofa arrives after.
const Scene = lazy(() =>
  import('@/scene/Scene').then((module) => ({ default: module.Scene })),
);

const App: React.FC = () => {
  const load = useConfigurator((state) => state.load);

  // Catalog and the configuration from the link, once at start.
  useEffect(() => {
    void load();
  }, [load]);

  useSelectionInUrl();
  const loaded = useLoading((state) => state.done);

  return (
    // Once, for the whole app: visitors who asked their system for less
    // motion get the changes without the sliding.
    <MotionConfig reducedMotion="user">
      {/* The scene fills the page; the top bar and the dock lie over it.
          inert while the loading screen covers it all: nothing underneath
          can be clicked or reached with Tab. */}
      <main inert={!loaded} className="relative h-full overflow-hidden">
        <div className="absolute inset-0 bg-studio">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
        <TopBar />
        <Dock />
      </main>
      <Loader />
    </MotionConfig>
  );
};

export default App;
