import { FC, memo, SetStateAction } from 'react';

import { ReplayState, TraversalResult } from '@components';
import { classer, Replayer, TIMEOUT_STEP } from '@services';

import styles from './ControlPanel.scss';

interface ControlPanelProps {
  className?: string;
  replayer: Replayer;
  replayState: ReplayState;
  result: TraversalResult;
  setResult: (value: SetStateAction<TraversalResult>) => void;
}

const ControlPanel: FC<ControlPanelProps> = memo(
  ({ className, replayer, replayState, result, setResult }) => {
    return (
      <div className={classer([styles.Container, className])}>
        <h4 className={styles.Label}>{result.label}</h4>
        <ol className={styles.ResultList}>
          {result.list.map((visitedItem) => {
            return (
              <li
                className={classer([
                  styles.ResultItem,
                  replayState.visitedVertexes[visitedItem.vertex.id] && styles.Visited
                ])}
                key={visitedItem.vertex.id}
              >
                {visitedItem.vertex.label}
              </li>
            );
          })}
        </ol>
        <div className={styles.Controls}>
          <button
            className={styles.Button}
            onClick={() => {
              replayer.pause();
            }}
          >
            pause
          </button>
          <button
            className={styles.Button}
            onClick={() => {
              if (replayer.isPaused) {
                replayer.unpause().play();
              }
            }}
          >
            resume
          </button>
          <button
            className={styles.Button}
            onClick={() => {
              setResult({ ...result });
              replayer.ready();
              replayer.play();
            }}
          >
            replay
          </button>
          <button
            className={styles.Button}
            onClick={() => {
              setResult({ label: '', list: [] });
              replayer.reset();
            }}
          >
            reset
          </button>
          <input
            className={styles.Timeout}
            defaultValue={replayer.timeout}
            onChange={(event) => {
              replayer.timeout = parseInt(event.target.value);
            }}
            step={TIMEOUT_STEP}
            type="number"
          />
        </div>
      </div>
    );
  }
);

ControlPanel.displayName = 'ControlPanel';

export { ControlPanel };
