const Bin = require("../models/binModel");
const calculateGraph = require("./calculateGraph");

let matrix = [];

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

  printPath(previous, start, end) {
    const path = [];
    for (let at = end; at !== null; at = previous[at]) {
      path.push(at);
    }
    path.reverse();
    if (path[0] === start) {
      return path;
    }
    return [];
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

async function fetchBins() {
  try {
    const bins = await Bin.find({ is_full: 1 });
    return bins;
  } catch (error) {
    console.error("Error fetching bins: ", error);
    return [];
  }
}

async function main() {
  const bins = await fetchBins();
  if (bins.length > 0) {
    const binData = bins.map((bin) => ({
      bin_lat: bin.bin_lat,
      bin_lng: bin.bin_lng,
    }));

    matrix = await calculateGraph(binData);
    console.log(matrix);

    const graph = new Graph(matrix);

    const startVertex = 0;
    const endVertex = 4;

    const { distances, previous } = graph.dijkstra(startVertex);
    const path = graph.printPath(previous, startVertex, endVertex);

    console.log("Shortest path from", startVertex, "to", endVertex, ":", path);
    module.exports = matrix;
  } else {
    console.log("No bins found or error fetching bins.");
  }
}

module.exports = main;

// [
//   [0, 210.56, 338.169, 218.246, 255.693, 251.522, 291.752, 215.352],
//   [427.834, 0, 201.312, 227.772, 265.219, 261.048, 151.776, 75.376],
//   [309.61, 214.138, 0, 60.587, 98.034, 93.863, 230.125, 235.542],
//   [373.982, 260.069, 300.67, 0, 37.447, 33.276, 225.403, 230.82],
//   [377.197, 286.85, 303.885, 157.186, 0, 94.185, 336.254, 321.496],
//   [313.999, 197.489, 240.687, 68.023, 66.591, 0, 218.456, 223.873],
//   [480.359, 138.575, 253.838, 217.055, 243.132, 209.435, 0, 73.546],
//   [406.813, 65.029, 180.292, 206.751, 244.198, 260.396, 76.399, 0],
// ];
