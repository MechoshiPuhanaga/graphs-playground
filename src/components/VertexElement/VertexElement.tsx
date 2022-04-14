import { FC, memo, useMemo, useState } from 'react';

import { useCanvas } from '@components/Canvas';
import { useClass, Vertex } from '@services';

import styles from './VertexElement.scss';
import { ContextMenu } from '@components/ContextMenu';

interface VertexProps {
  className?: string;
  isVisited?: boolean;
  vertex: Vertex;
}

const VertexElement: FC<VertexProps> = memo(({ className, isVisited, vertex }) => {
  const { from, graph, height, setFrom, setResult, width } = useCanvas();
  const [showMenu, setShowMenu] = useState(false);

  const style = useMemo(() => {
    return {
      top: vertex.coordinates.y * height,
      left: vertex.coordinates.x * width
    };
  }, [height, vertex.coordinates.x, vertex.coordinates.y, width]);

  return (
    <div
      className={useClass(
        [styles.Container, className, isVisited && styles.Visited, showMenu && styles.WithMenu],
        [className, isVisited, showMenu]
      )}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();

        setShowMenu(true);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        if (event.button !== 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (from && from.id === vertex.id) {
          setFrom(null);
        } else if (from) {
          try {
            graph.addEdge(from.id, vertex.id);
          } catch (error) {
          } finally {
            setFrom(null);
          }
        } else {
          setFrom(vertex);
        }
      }}
      style={style}
    >
      {showMenu ? (
        <ContextMenu
          close={() => setShowMenu(false)}
          graph={graph}
          setResult={setResult}
          vertex={vertex}
        />
      ) : null}
      <span className={styles.Label}>{vertex.label}</span>
    </div>
  );
});

export { VertexElement };
