/* eslint-disable @typescript-eslint/ban-types */
import { BinaryHeap } from '@mechoshi/data-structures';

import { calculateEdgeWeight } from '@services';

export interface Coordinates {
  x: number;
  y: number;
}

export interface Neighbor {
  id: string;
  weight: number;
}

export interface Vertex {
  coordinates: Coordinates;
  id: string;
  label: string;
  neighbors: Neighbor[];
}

export interface VertexPath extends Vertex {
  distance: number;
}

export interface Edge {
  from: string;
  to: string;
  weight: number;
}

export type AdjacencyList = Record<string, Vertex>;

export interface VisitedItem {
  from: string;
  vertex: Vertex;
}

export class Graph {
  static LABEL_ID = 65;

  adjacencyList: AdjacencyList = {};

  edges: Edge[] = [];

  onVersionUpdate: Function;

  __version = 0;

  constructor(onVersionUpdate: Function) {
    this.onVersionUpdate = onVersionUpdate;
  }

  get version() {
    return this.__version;
  }

  set version(newVersion) {
    this.__version = newVersion;
    this.onVersionUpdate(this.version);
  }

  addVertex({ coordinates, id }: { coordinates: Coordinates; id: string }): boolean {
    if (!this.adjacencyList[id]) {
      this.adjacencyList[id] = {
        coordinates,
        id,
        label: String.fromCharCode(Graph.LABEL_ID++),
        neighbors: []
      };
      this.version++;

      return true;
    }

    return false;
  }

  removeVertex(id: string) {
    const { neighbors } = this.adjacencyList[id];
    delete this.adjacencyList[id];

    this.edges = this.edges.filter((edge) => edge.from !== id && edge.to !== id);

    neighbors.forEach(({ id: neighborId }) => {
      this.adjacencyList[neighborId].neighbors = this.adjacencyList[neighborId].neighbors.filter(
        ({ id: vertexId }) => vertexId !== id
      );
    });

    this.version++;
  }

  updateVertexCoordinates({ coordinates, id }: { coordinates: Coordinates; id: string }) {
    if (this.adjacencyList[id]) {
      this.adjacencyList[id] = { ...this.adjacencyList[id], coordinates };

      // Recalculate the weight of the edges
      // connected to this vertex:
      this.edges = this.edges.map((edge) => {
        if (edge.from === id || edge.to === id) {
          const weight = calculateEdgeWeight(
            this.adjacencyList[edge.from],
            this.adjacencyList[edge.to]
          );

          // Update the weights in the vertexes:
          let neighborId = '';

          if (edge.from === id) {
            neighborId = edge.to;
          } else {
            neighborId = edge.from;
          }

          const neighbor = this.adjacencyList[neighborId];

          const neighborToUpdate = neighbor.neighbors.find(({ id: vertexId }) => vertexId === id);

          if (neighborToUpdate) {
            neighborToUpdate.weight = weight;
          }

          const neighborToUpdate2 = this.adjacencyList[id].neighbors.find(
            ({ id: vertexId }) => vertexId === neighborId
          );

          if (neighborToUpdate2) {
            neighborToUpdate2.weight = weight;
          }

          return {
            ...edge,
            weight
          };
        }

        return edge;
      });

      this.version++;
    }
  }

  addEdge(fromId: string, toId: string) {
    if (!this.adjacencyList[fromId] || !this.adjacencyList[toId]) {
      throw new Error("Can't add edge");
    } else {
      let flag = 0;

      const weight = calculateEdgeWeight(this.adjacencyList[fromId], this.adjacencyList[toId]);

      if (!this.adjacencyList[fromId].neighbors.find(({ id }) => id === toId)) {
        this.adjacencyList[fromId].neighbors.push({ id: toId, weight });
        flag++;
      }

      if (!this.adjacencyList[toId].neighbors.find(({ id }) => id === fromId)) {
        this.adjacencyList[toId].neighbors.push({ id: fromId, weight });
        flag++;
      }

      if (flag === 2) {
        this.edges.push({
          from: fromId,
          to: toId,
          weight: calculateEdgeWeight(this.adjacencyList[fromId], this.adjacencyList[toId])
        });

        this.version++;
      }
    }
  }

  removeEdge({ from, to }: Edge) {
    if (!this.adjacencyList[from] || !this.adjacencyList[to]) {
      throw new Error("Can't remove edge");
    } else {
      this.edges = this.edges.filter((edge) => !(edge.from === from && edge.to === to));

      this.adjacencyList[from].neighbors = this.adjacencyList[from].neighbors.filter(
        ({ id: vertexId }) => vertexId !== to
      );

      this.adjacencyList[to].neighbors = this.adjacencyList[to].neighbors.filter(
        ({ id: vertexId }) => vertexId !== from
      );

      this.version++;
    }
  }

  traverseDF(startId: string) {
    const visited = Object.keys(this.adjacencyList).reduce((obj, id) => {
      obj[id] = false;

      return obj;
    }, {} as Record<string, boolean>);

    const result: VisitedItem[] = [];

    const startVertex = this.adjacencyList[startId];

    const df = (visitedItem: VisitedItem) => {
      if (visited[visitedItem.vertex.id]) {
        return;
      }

      visited[visitedItem.vertex.id] = true;

      result.push(visitedItem);

      visitedItem.vertex.neighbors.forEach(({ id: neighborId }) =>
        df({ from: visitedItem.vertex.id, vertex: this.adjacencyList[neighborId] })
      );
    };

    df({ from: '', vertex: startVertex });

    return result;
  }

  traverseBF(startId: string) {
    const visited = Object.keys(this.adjacencyList).reduce((obj, id) => {
      obj[id] = false;

      return obj;
    }, {} as Record<string, boolean>);

    const result: VisitedItem[] = [];

    const startVertex = this.adjacencyList[startId];

    const queue: VisitedItem[] = [{ from: '', vertex: startVertex }];

    while (queue.length) {
      const visitedItem = queue.shift() as VisitedItem;

      if (!visited[visitedItem.vertex.id]) {
        result.push(visitedItem);
        visited[visitedItem.vertex.id] = true;

        if (visitedItem.vertex.neighbors.length) {
          queue.push(
            ...visitedItem.vertex.neighbors.map(({ id: vertexId }) => ({
              from: visitedItem.vertex.id,
              vertex: this.adjacencyList[vertexId]
            }))
          );
        }
      }
    }

    return result;
  }

  toString() {
    return JSON.stringify(this.adjacencyList);
  }

  Dijkstra(startId: string, endId: string, heuristics?: boolean) {
    const distances = Object.keys(this.adjacencyList).reduce((obj, vertexId) => {
      obj[vertexId] = vertexId === startId ? 0 : Infinity;

      return obj;
    }, {} as Record<string, number>);

    const previous = Object.keys(this.adjacencyList).reduce((obj, vertexId) => {
      obj[vertexId] = null;

      return obj;
    }, {} as Record<string, string | null>);

    const priorityQueue = new BinaryHeap<VertexPath>(
      (a: VertexPath, b: VertexPath) => a.distance < b.distance
    );

    Object.entries(this.adjacencyList).forEach(([vertexId, vertex]) => {
      if (vertexId === startId) {
        priorityQueue.insert({ ...vertex, distance: 0 });
      } else {
        priorityQueue.insert({ ...vertex, distance: Infinity });
      }
    });

    let shortestVertexPath = priorityQueue.root();

    const path: Vertex[] = [];
    const visited: Vertex[] = [];

    while (priorityQueue.size) {
      shortestVertexPath = priorityQueue.extract();

      if (shortestVertexPath?.id === endId) {
        let currentStep: string | null = endId;

        while (currentStep) {
          path.push(this.adjacencyList[currentStep]);
          currentStep = previous[currentStep];
        }
        break;
      }

      if (shortestVertexPath) {
        for (const neighbor of shortestVertexPath.neighbors) {
          const absoluteDistanceToEnd = calculateEdgeWeight(
            this.adjacencyList[endId],
            this.adjacencyList[neighbor.id]
          );
          const newDistance =
            distances[shortestVertexPath.id] +
            neighbor.weight +
            (heuristics ? absoluteDistanceToEnd : 0);

          if (newDistance < distances[neighbor.id]) {
            visited.push(this.adjacencyList[neighbor.id]);
            distances[neighbor.id] = newDistance;
            previous[neighbor.id] = shortestVertexPath.id;
            priorityQueue.insert({ ...this.adjacencyList[neighbor.id], distance: newDistance });
          }
        }
      }
    }

    path.reverse();

    return { path, visited };
  }
}
