class Graph {
  constructor(matrix) {
    this.matrix = matrix;
    this.numVertices = matrix.length;
  }

  dijkstra(start) {
    const distances = Array(this.numVertices).fill(Infinity);
    const visited = Array(this.numVertices).fill(false);
    const previous = Array(this.numVertices).fill(null);
    distances[start] = 0;

    for (let i = 0; i < this.numVertices - 1; i++) {
      const currentVertex = this.getMinDistanceVertex(distances, visited);
      visited[currentVertex] = true;

      for (let neighbor = 0; neighbor < this.numVertices; neighbor++) {
        if (!visited[neighbor] && this.matrix[currentVertex][neighbor] > 0) {
          const newDist =
            distances[currentVertex] + this.matrix[currentVertex][neighbor];
          if (newDist < distances[neighbor]) {
            distances[neighbor] = newDist;
            previous[neighbor] = currentVertex;
          }
        }
      }
    }

    return { distances, previous };
  }

  printPath(previous, end) {
    const path = [];
    for (let at = end; at !== null; at = previous[at]) {
      path.push(at);
    }
    path.reverse();
    return path;
  }

  getMinDistanceVertex(distances, visited) {
    let minDistance = Infinity;
    let minDistanceVertex = -1;

    for (let vertex = 0; vertex < this.numVertices; vertex++) {
      if (!visited[vertex] && distances[vertex] < minDistance) {
        minDistance = distances[vertex];
        minDistanceVertex = vertex;
      }
    }

    return minDistanceVertex;
  }
}

async function main(bins, nodes) {
  if (bins.length > 0) {
    const graph = new Graph(bins);
    let sourceNode = 0;
    const route = [];

    while (nodes.length) {
      const { distances, previous } = graph.dijkstra(sourceNode);
      const minDistanceNode = nodes.reduce(
        (minNode, node) =>
          distances[node] < distances[minNode] ? node : minNode,
        nodes[0]
      );
      const path = graph.printPath(previous, minDistanceNode);
      route.push(...path);
      nodes.splice(nodes.indexOf(minDistanceNode), 1);
      sourceNode = minDistanceNode;
    }

    const uniqueRoute = [...new Set(route)];
    console.log("Path: " + uniqueRoute.join(" -> "));

    return uniqueRoute;
  } else {
    console.log("No bins found or error fetching bins.");
  }
}

module.exports = main;
