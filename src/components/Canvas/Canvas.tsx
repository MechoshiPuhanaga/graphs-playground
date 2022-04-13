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
import { Graph, Replayer, useClass, Vertex } from '@services';

import styles from './Canvas.scss';
import { EdgeElement } from '@components/EdgeElement';

interface ICanvasContext {
  from: Vertex | null;
  graph: Graph;
  height: number;
  setFrom: Function;
  setResult: ({ label, list }: { label: string; list: Vertex[] }) => void;
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

  const [result, setResult] = useState<{ label: string; list: Vertex[] }>({ label: '', list: [] });

  const [context, setContext] = useState({ from, graph, height: 0, setFrom, setResult, width: 0 });

  const [replayState, setReplayState] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visitedEdges: any;
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

    result.list.forEach((vertex) => {
      replayer.add(() => {
        setReplayState((currentReplayState) => {
          return {
            ...currentReplayState,
            visitedVertexes: {
              ...currentReplayState.visitedVertexes,
              [vertex.id]: vertex
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
          return <EdgeElement edge={edge} key={`${edge.from}-${edge.to}`} />;
        })}
      </section>
      <div className={styles.Result}>
        <h4>{result.label}</h4>
        <div>{result.list.map((vertex) => vertex.label).join(' --> ')}</div>
      </div>
    </CanvasContext.Provider>
  );
};

export { Canvas, useCanvas };
