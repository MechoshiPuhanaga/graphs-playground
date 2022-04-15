import { Vertex } from '@services/models';

export const calculateEdgeWeight = (from: Vertex, to: Vertex) => {
  return Math.sqrt(
    (from.coordinates.x - to.coordinates.x) ** 2 + (from.coordinates.y - to.coordinates.y) ** 2
  );
};

export const classer = (styles: (string | boolean | undefined)[]) =>
  styles.filter(Boolean).join(' ');
