import { FC, memo, useCallback, useMemo, useState } from 'react';

import { useCanvas } from '@components';
import { classer } from '@services';

import styles from './Menu.scss';

interface MenuProps {
  className?: string;
}

const Menu: FC<MenuProps> = memo(({ className }) => {
  const { closeMenu, graph, setGraph } = useCanvas();
  const [graphName, setGraphName] = useState('');

  const saveGraph = useCallback(({ data, name }: { data: string; name: string }) => {
    const graphs = localStorage.getItem('graphs');

    if (!graphs) {
      localStorage.setItem('graphs', JSON.stringify({}));
    }

    const parsedGraphs = JSON.parse(localStorage.getItem('graphs') as string) as Record<
      string,
      string
    >;

    parsedGraphs[name] = data;

    localStorage.setItem(`graphs`, JSON.stringify(parsedGraphs));
  }, []);

  const savedGraphs = useMemo(() => {
    const graphs =
      (JSON.parse(localStorage.getItem('graphs') ?? '{}') as Record<string, string>) || {};

    return Object.keys(graphs);
  }, []);

  return (
    <div className={classer([styles.Container, className])}>
      <button className={styles.CloseButton} onClick={closeMenu}>
        close
      </button>
      <div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (graphName) {
              saveGraph({
                data: JSON.stringify({
                  adjacencyList: graph.adjacencyList,
                  edges: graph.edges
                }),
                name: graphName
              });
              closeMenu();
            }
          }}
        >
          <input
            className={styles.GraphName}
            onChange={(event) => setGraphName(event.target.value)}
            type="text"
            value={graphName}
          />
          <button className={styles.SaveButton} type="submit">
            save graph
          </button>
        </form>
        {savedGraphs.length ? (
          <div>
            <h4 className={styles.ListLabel}>saved graphs:</h4>
            <ul>
              {savedGraphs.map((name) => {
                return (
                  <li className={styles.ListItem} key={name}>
                    {name}
                    <div>
                      <button
                        className={styles.LoadButton}
                        onClick={() => {
                          const graphs =
                            (JSON.parse(localStorage.getItem('graphs') ?? '') as Record<
                              string,
                              string
                            >) || {};

                          const graphToLoad = graphs[name];

                          if (graphToLoad) {
                            setGraph(graphToLoad);
                          }

                          closeMenu();
                        }}
                      >
                        load
                      </button>
                      <button
                        className={styles.DeleteButton}
                        onClick={() => {
                          const graphs =
                            (JSON.parse(localStorage.getItem('graphs') ?? '') as Record<
                              string,
                              string
                            >) || {};

                          delete graphs[name];

                          localStorage.setItem(`graphs`, JSON.stringify(graphs));
                          closeMenu();
                        }}
                      >
                        delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
});

Menu.displayName = 'Menu';

export { Menu };
