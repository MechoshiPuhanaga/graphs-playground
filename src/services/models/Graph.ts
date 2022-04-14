/* eslint-disable @typescript-eslint/ban-types */
export interface Coordinates {
  x: number;
  y: number;
}

export interface Vertex {
  coordinates: Coordinates;
  id: string;
  label: string;
  neighbors: string[];
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

    neighbors.forEach((neighborId) => {
      this.adjacencyList[neighborId].neighbors = this.adjacencyList[neighborId].neighbors.filter(
        (vertexId) => vertexId !== id
      );
    });

    this.version++;
  }

  updateVertexCoordinates({ coordinates, id }: { coordinates: Coordinates; id: string }): boolean {
    if (this.adjacencyList[id]) {
      this.adjacencyList[id] = { ...this.adjacencyList[id], coordinates };
      this.version++;

      return true;
    }

    return false;
  }

  addEdge(fromId: string, toId: string) {
    if (!this.adjacencyList[fromId] || !this.adjacencyList[toId]) {
      throw new Error("Can't add edge");
    } else {
      let flag = 0;
      if (!this.adjacencyList[fromId].neighbors.includes(toId)) {
        this.adjacencyList[fromId].neighbors.push(toId);
        flag++;
      }

      if (!this.adjacencyList[toId].neighbors.includes(fromId)) {
        this.adjacencyList[toId].neighbors.push(fromId);
        flag++;
      }

      if (flag === 2) {
        const from = this.adjacencyList[fromId];
        const to = this.adjacencyList[toId];

        const length = Math.sqrt(
          (from.coordinates.x - to.coordinates.x) ** 2 +
            (from.coordinates.y - to.coordinates.y) ** 2
        );

        this.edges.push({
          from: fromId,
          to: toId,
          weight: length
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
        (vertexId) => vertexId !== to
      );

      this.adjacencyList[to].neighbors = this.adjacencyList[to].neighbors.filter(
        (vertexId) => vertexId !== from
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

      visitedItem.vertex.neighbors.forEach((neighborId) =>
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
            ...visitedItem.vertex.neighbors.map((vertexId) => ({
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
}
