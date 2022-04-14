/* eslint-disable @typescript-eslint/ban-types */
import {
  createContext,
  FC,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { VertexElement } from '@components';
import { Graph, Replayer, useClass, Vertex, VisitedItem } from '@services';

import styles from './Canvas.scss';
import { EdgeElement } from '@components/EdgeElement';

interface ICanvasContext {
  from: Vertex | null;
  graph: Graph;
  height: number;
  setFrom: Function;
  setResult: ({ label, list }: { label: string; list: VisitedItem[] }) => void;
  width: number;
}

const initialCanvasContext: ICanvasContext = {
  from: null,
  graph: new Graph(() => {}),
  height: 0,
  setFrom: () => {},
  setResult: () => {},
  width: 0
};

const CanvasContext = createContext(initialCanvasContext);

const useCanvas = () => {
  return useContext(CanvasContext);
};

interface CanvasProps {
  className?: string;
  graph: Graph;
}

const Canvas: FC<CanvasProps> = ({ className, graph }) => {
  const element = useRef<HTMLDivElement | null>(null);

  const [from, setFrom] = useState<Vertex | null>(null);

  const [result, setResult] = useState<{ label: string; list: VisitedItem[] }>({
    label: '',
    list: []
  });

  const [context, setContext] = useState({ from, graph, height: 0, setFrom, setResult, width: 0 });

  const [replayState, setReplayState] = useState<{
    visitedEdges: Record<string, boolean>;
    visitedVertexes: Record<string, Vertex>;
  }>({
    visitedEdges: {},
    visitedVertexes: {}
  });

  const replayer = useMemo(() => new Replayer({ timeout: 1000 }), []);

  const onDoubleClickHandler = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY, target } = event;

      const targetElement = target as HTMLElement;

      graph.addVertex({
        coordinates: {
          x: clientX / targetElement.offsetWidth,
          y: clientY / targetElement.offsetHeight
        },
        id: `${new Date().getTime()}`
      });
    },
    [graph]
  );

  useEffect(() => {
    setContext((currentContext) => {
      return {
        ...currentContext,
        from
      };
    });
  }, [from]);

  useEffect(() => {
    const resizeHandler = () => {
      setContext((currentContext) => {
        return {
          ...currentContext,
          height: element.current?.offsetHeight ?? 0,
          width: element.current?.offsetWidth ?? 0
        };
      });
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  useEffect(() => {
    setContext((currentContext) => {
      return {
        ...currentContext,
        height: element.current?.offsetHeight ?? 0,
        width: element.current?.offsetWidth ?? 0
      };
    });
  }, []);

  useEffect(() => {
    replayer.reset();

    setReplayState(() => ({ visitedEdges: {}, visitedVertexes: {} }));

    result.list.forEach((visitedItem, i, list) => {
      replayer.add(() => {
        setReplayState((currentReplayState) => {
          return {
            ...currentReplayState,
            visitedEdges: {
              ...currentReplayState.visitedEdges,
              [`${list[i].from}-${list[i].vertex.id}`]: true
            },
            visitedVertexes: {
              ...currentReplayState.visitedVertexes,
              [visitedItem.vertex.id]: visitedItem.vertex
            }
          };
        });
      });
    });

    if (result.list.length) {
      replayer.ready();
      replayer.play();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <CanvasContext.Provider value={context}>
      <section
        className={useClass([styles.Container, className], [className])}
        onMouseDown={() => {
          setFrom(null);
        }}
        onDoubleClick={onDoubleClickHandler}
        ref={element}
      >
        {Object.entries(graph.adjacencyList).map(([vertexId, vertex]) => {
          return (
            <VertexElement
              isVisited={!!replayState.visitedVertexes[vertexId]}
              key={vertexId}
              vertex={vertex}
            />
          );
        })}
        {graph.edges.map((edge) => {
          return (
            <EdgeElement
              edge={edge}
              isVisited={
                !!(
                  replayState.visitedEdges[`${edge.from}-${edge.to}`] ||
                  replayState.visitedEdges[`${edge.to}-${edge.from}`]
                )
              }
              key={`${edge.from}-${edge.to}`}
            />
          );
        })}
      </section>
      <div className={styles.Result}>
        {result.list.length ? (
          <>
            <h4>{result.label}</h4>
            <ol className={styles.ResultList}>
              {result.list.map((visitedItem) => {
                return (
                  <li
                    className={[
                      styles.ResultItem,
                      replayState.visitedVertexes[visitedItem.vertex.id] && styles.Visited
                    ]
                      .filter(Boolean)
                      .join(' ')}
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
                Pause
              </button>
              <button
                className={styles.Button}
                onClick={() => {
                  if (replayer.isPaused) {
                    replayer.unpause().play();
                  }
                }}
              >
                Resume
              </button>
              <button
                className={styles.Button}
                onClick={() => {
                  setResult({ label: '', list: [] });
                  replayer.reset();
                }}
              >
                Reset
              </button>
              <input
                className={styles.Timeout}
                defaultValue={replayer.timeout}
                onChange={(event) => {
                  replayer.timeout = parseInt(event.target.value);
                }}
                step={100}
                type="number"
              />
            </div>
          </>
        ) : null}
      </div>
    </CanvasContext.Provider>
  );
};

export { Canvas, useCanvas };
