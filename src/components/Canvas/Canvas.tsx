/* eslint-disable @typescript-eslint/ban-types */
import {
  createContext,
  FC,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import { VertexElement } from '@components';
import { Graph, useClass, Vertex } from '@services';

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

  const onDoubleClickHandler = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY, target } = event;

      const element = target as HTMLElement;

      graph.addVertex({
        coordinates: { x: clientX / element.offsetWidth, y: clientY / element.offsetHeight },
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

  return (
    <CanvasContext.Provider value={context}>
      <section
        className={useClass([styles.Container, className], [className])}
        onDoubleClick={onDoubleClickHandler}
        ref={element}
      >
        {Object.entries(graph.adjacencyList).map(([vertexId, vertex]) => {
          return <VertexElement key={vertexId} vertex={vertex} />;
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
