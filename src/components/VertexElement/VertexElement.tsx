import { DragEvent, FC, memo, useCallback, useMemo, useState } from 'react';

import { useCanvas } from '@components/Canvas';
import { useClass, Vertex } from '@services';

import styles from './VertexElement.scss';
import { ContextMenu } from '@components/ContextMenu';

interface VertexProps {
  className?: string;
  isEvaluated?: boolean;
  isFrom?: boolean;
  isVisited?: boolean;
  vertex: Vertex;
}

const VertexElement: FC<VertexProps> = memo(
  ({ className, isEvaluated, isFrom, isVisited, vertex }) => {
    const { from, graph, height, path, setFrom, setPath, setResult, width } = useCanvas();
    const [showMenu, setShowMenu] = useState(false);

    const style = useMemo(() => {
      return {
        top: vertex.coordinates.y * height,
        left: vertex.coordinates.x * width
      };
    }, [height, vertex.coordinates.x, vertex.coordinates.y, width]);

    const onDragEndHandler = useCallback(
      (event: DragEvent<HTMLDivElement>) => {
        const { clientX, clientY } = event;

        graph.updateVertexCoordinates({
          coordinates: {
            x: clientX / width,
            y: clientY / height
          },
          id: vertex.id
        });
      },
      [graph, height, vertex.id, width]
    );

    return (
      <div
        className={useClass(
          [
            styles.Container,
            className,
            isVisited && styles.Visited,
            showMenu && styles.WithMenu,
            isFrom && styles.IsFrom,
            isEvaluated && styles.IsEvaluated
          ],
          [className, isEvaluated, isFrom, isVisited, showMenu]
        )}
        draggable
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();

          setShowMenu(true);
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDragEnd={onDragEndHandler}
        onDragStart={() => {
          setFrom(null);
        }}
        onMouseDown={(event) => {
          if (event.button !== 0) {
            return;
          }

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
            path={path}
            setPath={setPath}
            setResult={setResult}
            vertex={vertex}
          />
        ) : null}
        <span className={styles.Label}>{vertex.label}</span>
      </div>
    );
  }
);

VertexElement.displayName = 'VertexElement';

export { VertexElement };
