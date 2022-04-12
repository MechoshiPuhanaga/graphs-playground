import { FC, memo } from 'react';

import styles from './App.scss';

const App: FC = () => {
  return (
    <main className={styles.Container}>
      <h1>Hi</h1>
    </main>
  );
};

export default memo(App);
