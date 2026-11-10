import { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'motion/react';

import { Loader } from '@/loader/Loader';
import { Panel } from '@/panel/Panel';
import { useConfigurator } from '@/store/configurator/useConfigurator';
import { useLoading } from '@/store/loading/useLoading';
import { useSelectionInUrl } from '@/store/configurator/useSelectionInUrl';

// three.js is most of the JavaScript, so the scene comes in its own chunk:
// the options and the price show first, the sofa arrives right after.
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
      {/* Phone: scene on top (a bit over half the screen, so the sofa stays
          in view while choosing), panel below. From lg: scene left, panel right. */}
      {/* inert while the loading screen covers it: nothing underneath can
          be clicked or reached with Tab. */}
      <main inert={!loaded} className="flex h-full flex-col lg:flex-row">
        <div className="relative h-[55%] shrink-0 bg-scene lg:h-auto lg:flex-1">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
        <Panel />
      </main>
      <Loader />
    </MotionConfig>
  );
};

export default App;
