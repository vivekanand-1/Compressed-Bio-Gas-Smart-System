/**
 * tspSolver.js
 * Utilizes OSRM API to get travel distances/times between coordinates and runs a TSP (Traveling Salesperson) algorithm.
 */

// OSRM Public API endpoint for driving time matrices
const OSRM_BASE_URL = 'http://router.project-osrm.org/table/v1/driving';

/**
 * Fetch real-world distance matrix from OSRM
 * @param {Array<{lat, lng}>} locations 
 */
async function fetchDistanceMatrix(locations) {
    if (locations.length < 2) return null;

    // OSRM requires coordinates in longitude,latitude format separated by semicolons
    const coordsString = locations.map(loc => `${loc.lng},${loc.lat}`).join(';');
    const url = `${OSRM_BASE_URL}/${coordsString}?annotations=duration,distance`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OSRM API error: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.code !== 'Ok') {
            throw new Error('OSRM returned non-OK code');
        }
        
        // Returns 2D arrays: duration (in seconds), distance (in meters)
        return {
            durations: data.durations, // e.g. durations[fromIndex][toIndex]
            distances: data.distances
        };
    } catch (error) {
        console.error("Distance Matrix Fetch Error:", error);
        throw error;
    }
}

/**
 * Solve TSP using Nearest Neighbor Algorithm (Greedy)
 * Fast and effective for smaller B.Tech level demo graphs (N < 100)
 * @param {Object} matrix containing 2D arrays of { durations, distances }
 * @returns {Array<Number>} Array of ordered indices representing the optimal path
 */
function solveNearestNeighbor(matrix) {
    const n = matrix.distances.length;
    const visited = new Set();
    const route = [];
    
    // We assume index 0 is the starting origin point
    let currentNode = 0;
    route.push(currentNode);
    visited.add(currentNode);
    
    while (visited.size < n) {
        let nearestDistance = Infinity;
        let nearestNode = -1;
        
        for (let nextNode = 0; nextNode < n; nextNode++) {
            if (!visited.has(nextNode)) {
                // Focus on minimizing distance for TSP cost (could mix with time)
                const dist = matrix.distances[currentNode][nextNode];
                if (dist < nearestDistance) {
                    nearestDistance = dist;
                    nearestNode = nextNode;
                }
            }
        }
        
        if (nearestNode !== -1) {
            route.push(nearestNode);
            visited.add(nearestNode);
            currentNode = nearestNode;
        } else {
            break; // Failsafe
        }
    }
    
    return route;
}

/**
 * Main optimized route handler
 * @param {Array} locations [{ id, name, lat, lng }, ...]
 */
async function optimizeMultiStopRoute(locations) {
    if (locations.length <= 1) {
        return { optimizedOrder: locations, totalDistanceMt: 0, totalDurationSec: 0 };
    }
    
    const matrix = await fetchDistanceMatrix(locations);
    const optimizedIndices = solveNearestNeighbor(matrix);
    
    // Reconstruct the ordered array and summation
    const optimizedOrder = [];
    let totalDistanceMt = 0;
    let totalDurationSec = 0;
    
    for (let i = 0; i < optimizedIndices.length; i++) {
        const fromIdx = optimizedIndices[i];
        optimizedOrder.push(locations[fromIdx]);
        
        if (i < optimizedIndices.length - 1) {
            const toIdx = optimizedIndices[i + 1];
            totalDistanceMt += matrix.distances[fromIdx][toIdx];
            totalDurationSec += matrix.durations[fromIdx][toIdx];
        }
    }
    
    return {
        optimizedOrder,
        totalDistanceMt,
        totalDurationSec
    };
}

module.exports = {
    optimizeMultiStopRoute
};
