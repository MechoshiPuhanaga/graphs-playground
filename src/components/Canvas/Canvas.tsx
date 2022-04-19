/* eslint-disable @typescript-eslint/ban-types */
import {
  createContext,
  Dispatch,
  FC,
  MouseEvent,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { ControlPanel, EdgeElement, Menu, VertexElement } from '@components';
import { Graph, Replayer, REPLAY_TIMEOUT, useClass, Vertex, VisitedItem } from '@services';

import styles from './Canvas.scss';

export interface TraversalResult {
  label: string;
  list: VisitedItem[];
  meta?: { visited: Vertex[] };
}

export interface ReplayState {
  evaluatedVertexes: Record<string, Vertex>;
  visitedEdges: Record<string, boolean>;
  visitedVertexes: Record<string, Vertex>;
}

export interface Path {
  from: string;
  to: string;
}

interface ICanvasContext {
  closeMenu: () => void;
  from: Vertex | null;
  graph: Graph;
  height: number;
  path: Path;
  setGraph: (data: string) => void;
  setFrom: Function;
  setPath: Dispatch<SetStateAction<Path>>;
  setResult: ({ label, list }: TraversalResult) => void;
  width: number;
}

const initialCanvasContext: ICanvasContext = {
  closeMenu: () => {},
  from: null,
  graph: new Graph(() => {}),
  height: 0,
  path: { from: '', to: '' },
  setGraph: () => {},
  setFrom: () => {},
  setPath: () => {},
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
  setVersion: Dispatch<SetStateAction<number>>;
}

const Canvas: FC<CanvasProps> = ({ className, graph: initialGraph, setVersion }) => {
  const element = useRef<HTMLDivElement | null>(null);

  const [graph, setGraph] = useState(initialGraph);

  const [openMenu, setOpenMenu] = useState(false);

  const [from, setFrom] = useState<Vertex | null>(null);

  const [path, setPath] = useState<Path>({ from: '', to: '' });

  const [result, setResult] = useState<TraversalResult>({
    label: '',
    list: []
  });

  const closeMenu = useCallback(() => setOpenMenu(false), []);

  const [context, setContext] = useState({
    closeMenu,
    from,
    graph,
    height: 0,
    path,
    setGraph: (data: string) => setGraph(Graph.fromJSON({ data, onVersionUpdate: setVersion })),
    setFrom,
    setPath,
    setResult,
    width: 0
  });

  const [replayState, setReplayState] = useState<ReplayState>({
    evaluatedVertexes: {},
    visitedEdges: {},
    visitedVertexes: {}
  });

  const replayer = useMemo(() => new Replayer({ timeout: REPLAY_TIMEOUT }), []);

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
        graph,
        from,
        path
      };
    });
  }, [from, graph, path]);

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

    setReplayState(() => ({ evaluatedVertexes: {}, visitedEdges: {}, visitedVertexes: {} }));

    const evaluatedVertexes =
      result.meta?.visited.reduce((obj, vertex) => {
        obj[vertex.id] = vertex;

        return obj;
      }, {} as Record<string, Vertex>) ?? {};

    result.list.forEach((visitedItem, i, list) => {
      replayer.add(() => {
        setReplayState((currentReplayState) => {
          return {
            ...currentReplayState,
            evaluatedVertexes,
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
        <button
          className={styles.ClearButton}
          onClick={() => {
            graph.adjacencyList = {};
            graph.edges = [];
            replayer.reset();
            setResult({ label: '', list: [] });
            Graph.LABEL_ID = 65;
          }}
        >
          clear
        </button>
        <button
          className={styles.MenuButton}
          onClick={() => {
            setOpenMenu(true);
          }}
        >
          menu
        </button>
        {Object.entries(context.graph.adjacencyList).map(([vertexId, vertex]) => {
          return (
            <VertexElement
              isEvaluated={!!replayState.evaluatedVertexes[vertexId]}
              isFrom={from?.id === vertexId || result.list[0]?.vertex?.id === vertexId}
              isVisited={!!replayState.visitedVertexes[vertexId]}
              key={vertexId}
              vertex={vertex}
            />
          );
        })}
        {context.graph.edges.map((edge) => {
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
        {openMenu ? <Menu className={styles.Menu} /> : null}
        <ControlPanel
          className={useClass(
            [styles.ControlPanel, !result.list.length && styles.Hidden],
            [result.list.length]
          )}
          replayer={replayer}
          replayState={replayState}
          result={result}
          setResult={setResult}
        />
      </section>
    </CanvasContext.Provider>
  );
};

export { Canvas, useCanvas };
