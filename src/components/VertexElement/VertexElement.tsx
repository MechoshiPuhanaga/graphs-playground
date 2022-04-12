import { FC, memo, useMemo } from 'react';

import { useCanvas } from '@components/Canvas';
import { useClass, Vertex } from '@services';

import styles from './VertexElement.scss';

interface VertexProps {
  className?: string;
  vertex: Vertex;
}

const VertexElement: FC<VertexProps> = memo(({ className, vertex }) => {
  const { from, graph, height, setFrom, width } = useCanvas();

  const style = useMemo(() => {
    return {
      top: vertex.coordinates.y * height,
      left: vertex.coordinates.x * width
    };
  }, [height, vertex.coordinates.x, vertex.coordinates.y, width]);

  return (
    <div
      className={useClass([styles.Container, className], [className])}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (from && from.id === vertex.id) {
          setFrom(null);
        } else if (from) {
          graph.addEdge(from.id, vertex.id);
          setFrom(null);
        } else {
          setFrom(vertex);
        }
      }}
      style={style}
    >
      <span className={styles.Label}>{vertex.label}</span>
    </div>
  );
});

export { VertexElement };
