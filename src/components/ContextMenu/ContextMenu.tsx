import { FC, memo, useCallback, useRef } from 'react';

import { Graph, useClass, useOnEvents, Vertex, VisitedItem } from '@services';

import styles from './ContextMenu.scss';

interface ContextMenuProps {
  className?: string;
  close: () => void;
  graph: Graph;
  setResult: ({ label, list }: { label: string; list: VisitedItem[] }) => void;
  vertex: Vertex;
}

const ContextMenu: FC<ContextMenuProps> = memo(({ className, close, graph, setResult, vertex }) => {
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
          graph.removeVertex(vertex.id);

          close();
        }, [close, graph, vertex.id])}
      >
        Delete
      </button>
    </div>
  );
});

ContextMenu.displayName = 'ContextMenu';

export { ContextMenu };
