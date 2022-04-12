import { FC, memo, useEffect, useMemo, useState } from 'react';

import { Canvas } from '@components';

import styles from './App.scss';
import { Graph } from '@services';

const App: FC = () => {
  const [, setVersion] = useState(0);

  const graph = useMemo(() => new Graph(setVersion), []);

  useEffect(() => {
    setVersion(graph.version);
  }, [graph.version]);

  return (
    <main className={styles.Container}>
      <Canvas className={styles.Canvas} graph={graph} />
    </main>
  );
};

export default memo(App);
