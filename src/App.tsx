import { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'motion/react';

import { useConfigurator } from '@/store/configurator/useConfigurator';
import { useSelectionInUrl } from '@/store/configurator/useSelectionInUrl';
import { useLoading } from '@/store/loading/useLoading';

import { Dock } from '@/ui/dock/Dock';
import { Loader } from '@/ui/loader/Loader';
import { TopBar } from '@/ui/topBar/TopBar';

// three.js is most of the JavaScript, so the 3D experience comes in its own
// chunk: the page and the loading screen show at once, the sofa arrives after.
const Experience = lazy(() =>
  import('@/experience/Experience').then((module) => ({
    default: module.Experience,
  })),
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
      {/* The 3D experience fills the page; the UI (top bar and dock) lies
          over it. inert while the loading screen covers it all: nothing
          underneath can be clicked or reached with Tab. */}
      <main inert={!loaded} className="relative h-full overflow-hidden">
        <div className="absolute inset-0 bg-studio">
          <Suspense fallback={null}>
            <Experience />
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
