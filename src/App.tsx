import { lazy, Suspense, useEffect } from 'react';

import { Panel } from '@/panel/Panel';
import { useConfigurator } from '@/store/configurator/useConfigurator';

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

  return (
    // Phone: scene on top (a bit over half the screen, so the sofa stays in
    // view while choosing), panel below. From lg: scene left, panel right.
    <main className="flex h-full flex-col lg:flex-row">
      <div className="relative h-[55%] shrink-0 bg-scene lg:h-auto lg:flex-1">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>
      <Panel />
    </main>
  );
};

export default App;
