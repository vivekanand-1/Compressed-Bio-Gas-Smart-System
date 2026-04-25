// Unified Pathfinder: Dijkstra and A* support
const dataset = require('../data/dataset.json');

class PriorityQueue {
    constructor() {
        this.elements = [];
    }
    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
        return this.elements.shift().element;
    }
    isEmpty() {
        return this.elements.length === 0;
    }
}

// Haversine distance or simple Euclidean for coordinates
function calculateHeuristic(nodeA, nodeB) {
    const coordsA = dataset.nodes[nodeA];
    const coordsB = dataset.nodes[nodeB];
    if (!coordsA || !coordsB) return 0;
    
    // Simple scaled euclidean distance for A* heuristic
    const dx = coordsA.lat - coordsB.lat;
    const dy = coordsA.lng - coordsB.lng;
    return Math.sqrt(dx*dx + dy*dy) * 111; // rough km conversion
}

// Calculate cost based on Multi-variable factors (Fuel/Distance + Time)
function getEdgeCost(weightData, fuelFactor = 1.0, timeFactor = 1.0) {
    return (weightData.distance * fuelFactor) + (weightData.time * timeFactor);
}

/**
 * calculatePath
 * @param {string} startNode
 * @param {string} endNode (optional for pure Dijkstra all-paths)
 * @param {boolean} useAStar 
 * @param {object} costFactors { fuelFactor, timeFactor }
 */
function calculatePath(startNode, endNode = null, useAStar = false, costFactors = { fuelFactor: 1, timeFactor: 1 }) {
    const graph = dataset.edges;
    let distances = {};
    let previous = {};
    let pq = new PriorityQueue();

    // Track execution time
    const startTime = performance.now();

    for (let node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    
    distances[startNode] = 0;
    pq.enqueue(startNode, 0);

    while (!pq.isEmpty()) {
        let currentNode = pq.dequeue();

        if (endNode && currentNode === endNode) {
             break; // Early exit for A* / Point-to-point Dijkstra
        }

        if (distances[currentNode] === Infinity) continue;

        for (let neighbor in graph[currentNode]) {
            let edgeData = graph[currentNode][neighbor];
            let cost = getEdgeCost(edgeData, costFactors.fuelFactor, costFactors.timeFactor);
            let alt = distances[currentNode] + cost;

            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = currentNode;
                
                let priority = alt;
                if (useAStar && endNode) {
                    priority += calculateHeuristic(neighbor, endNode);
                }
                
                pq.enqueue(neighbor, priority);
            }
        }
    }
    
    const executionTimeMs = performance.now() - startTime;

    return { distances, previous, executionTimeMs };
}

function getPath(previous, targetNode) {
    const path = [];
    let currentNode = targetNode;
    while (currentNode) {
        path.unshift(currentNode);
        currentNode = previous[currentNode];
    }
    return path; // Only return if valid. If start node, length >= 1.
}

module.exports = { calculatePath, getPath };
