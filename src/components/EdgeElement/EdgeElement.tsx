import { FC, memo, MouseEvent, useCallback, useMemo } from 'react';

import { useCanvas } from '@components';
import { Edge, useClass } from '@services';

import styles from './EdgeElement.scss';

interface EdgeProps {
  className?: string;
  edge: Edge;
}

const EdgeElement: FC<EdgeProps> = memo(({ className, edge }) => {
  const { graph, height, width } = useCanvas();

  const style = useMemo(() => {
    const from = graph.adjacencyList[edge.from];
    const to = graph.adjacencyList[edge.to];

    const length = Math.sqrt(
      (from.coordinates.x * width - to.coordinates.x * width) ** 2 +
        (from.coordinates.y * height - to.coordinates.y * height) ** 2
    );

    const deltaX = Math.sign(from.coordinates.x * width - to.coordinates.x * width);
    const deltaY = Math.sign(from.coordinates.y * height - to.coordinates.y * height);

    const a = Math.abs(from.coordinates.x * width - to.coordinates.x * width);

    const angle = (Math.asin(a / length) * 180) / Math.PI;

    let correction = 180;

    if (deltaY < 0) {
      correction = 0;
    }

    let sign = 1;

    if (deltaX === deltaY) {
      sign = -1;
    }

    return {
      top: from.coordinates.y * height,
      left: from.coordinates.x * width,
      height: length,
      transform: `rotate(${sign * angle + correction}deg) translateX(-2px)`
    };
  }, [edge, graph.adjacencyList, height, width]);

  const onDoubleClickHandler = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      graph.removeEdge(edge);
    },
    [edge, graph]
  );

  return (
    <div
      className={useClass([styles.Container, className], [className])}
      onDoubleClick={onDoubleClickHandler}
      style={style}
    ></div>
  );
});

export { EdgeElement };
