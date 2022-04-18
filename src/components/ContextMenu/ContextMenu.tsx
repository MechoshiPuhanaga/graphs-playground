import { Dispatch, FC, memo, SetStateAction, useCallback, useRef } from 'react';

import { Path, TraversalResult } from '@components';
import { Graph, useClass, useOnEvents, Vertex } from '@services';

import styles from './ContextMenu.scss';

interface ContextMenuProps {
  className?: string;
  close: () => void;
  graph: Graph;
  path: Path;
  setPath: Dispatch<SetStateAction<Path>>;
  setResult: (traversalResult: TraversalResult) => void;
  vertex: Vertex;
}

const ContextMenu: FC<ContextMenuProps> = memo(
  ({ className, close, graph, path, setPath, setResult, vertex }) => {
    const element = useRef<HTMLDivElement | null>(null);

    useOnEvents({ callback: close, element, events: ['click'] });

    return (
      <div
        className={useClass([styles.Container, className], [className])}
        onMouseLeave={useCallback(close, [close])}
        ref={element}
      >
        <div className={styles.Header}>
          <h4 className={styles.Title}>Vertex {vertex.label}</h4>
          <button className={styles.Close} onClick={close}>
            X
          </button>
        </div>
        <button
          className={styles.Button}
          onClick={useCallback(() => {
            const result = graph.traverseDF(vertex.id);

            setResult({ label: `Depth first from ${vertex.label}`, list: result });

            close();
          }, [close, graph, setResult, vertex.id, vertex.label])}
        >
          Depth First Traverse
        </button>
        <button
          className={styles.Button}
          onClick={useCallback(() => {
            const result = graph.traverseBF(vertex.id);

            setResult({ label: `Breadth first from ${vertex.label}`, list: result });

            close();
          }, [close, graph, setResult, vertex.id, vertex.label])}
        >
          Breadth First Traverse
        </button>
        <button
          className={styles.Button}
          onClick={useCallback(() => {
            if (path.from === vertex.id) {
              setPath({ from: '', to: '' });
            } else if (path.from) {
              setPath((currentPath) => ({ ...currentPath, to: vertex.id }));
              const result = graph.Dijkstra(path.from, vertex.id);
              setPath({ from: '', to: '' });

              const labelFrom =
                result.path.find((pathVertex) => pathVertex.id === path.from)?.label ?? '';
              const labelTo =
                result.path.find((pathVertex) => pathVertex.id === vertex.id)?.label ?? '';

              setResult({
                label: `Dijkstra from ${labelFrom} to ${labelTo}`,
                list: result.path.map((currentVertex, index, list) => {
                  return {
                    from: list[index - 1]?.id ?? '',
                    vertex: currentVertex
                  };
                }),
                meta: { visited: result.visited }
              });
            } else {
              setPath((currentPath) => ({ ...currentPath, from: vertex.id }));
            }

            close();
          }, [close, graph, path, setPath, setResult, vertex.id])}
        >
          {path.from ? 'Dijkstra To' : 'Dijkstra From'}
        </button>
        {path.from ? (
          <button
            className={styles.Button}
            onClick={() => {
              if (path.from === vertex.id) {
                setPath({ from: '', to: '' });
              } else if (path.from) {
                setPath((currentPath) => ({ ...currentPath, to: vertex.id }));
                const result = graph.Dijkstra(path.from, vertex.id, true);
                setPath({ from: '', to: '' });

                const labelFrom =
                  result.path.find((pathVertex) => pathVertex.id === path.from)?.label ?? '';
                const labelTo =
                  result.path.find((pathVertex) => pathVertex.id === vertex.id)?.label ?? '';

                setResult({
                  label: `Dijkstra from ${labelFrom} to ${labelTo}`,
                  list: result.path.map((currentVertex, index, list) => {
                    return {
                      from: list[index - 1]?.id ?? '',
                      vertex: currentVertex
                    };
                  }),
                  meta: { visited: result.visited }
                });
              } else {
                setPath((currentPath) => ({ ...currentPath, from: vertex.id }));
              }

              close();
            }}
          >
            {path.from ? 'Dijkstra To with Heuristics' : 'Dijkstra From'}
          </button>
        ) : null}
        <button
          className={styles.Button}
          onClick={useCallback(() => {
            graph.removeVertex(vertex.id);

            close();
          }, [close, graph, vertex.id])}
        >
          Delete
        </button>
      </div>
    );
  }
);

ContextMenu.displayName = 'ContextMenu';

export { ContextMenu };
