import { useEffect } from 'react';

import { Scene } from '@/scene/Scene';
import { useConfigurator } from '@/store/configurator/useConfigurator';

const App: React.FC = () => {
  const load = useConfigurator((state) => state.load);

  // Catalog and the configuration from the link, once at start.
  useEffect(() => {
    void load();
  }, [load]);

  return <Scene />;
};

export default App;
