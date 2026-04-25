const express = require('express');
const router = express.Router();
const { calculatePath, getPath } = require('../controllers/pathfinder');
const dataset = require('../data/dataset.json');

// GET /api/optimize
router.get('/', (req, res, next) => {
    try {
        const startNode = req.query.start || 'Plant';
        const endNode = req.query.end || null;
        const useAStar = req.query.algorithm === 'astar';
        
        // Multi-factors
        const fuelFactor = parseFloat(req.query.fuel) || 1.0;
        const timeFactor = parseFloat(req.query.time) || 1.0;
        
        if (!dataset.edges[startNode]) {
            return res.status(400).json({ success: false, message: "Invalid start node" });
        }
        if (endNode && !dataset.edges[endNode]) {
             return res.status(400).json({ success: false, message: "Invalid end node" });
        }

        const { distances, previous, executionTimeMs } = calculatePath(
            startNode, 
            endNode, 
            useAStar, 
            { fuelFactor, timeFactor }
        );
        
        // Format results
        let results = [];
        if (endNode) {
            results.push({
                destination: endNode,
                cost: distances[endNode],
                path: getPath(previous, endNode)
            });
        } else {
            results = Object.keys(distances).map(node => ({
                destination: node,
                cost: distances[node],
                path: getPath(previous, node)
            }));
        }

        res.json({
            success: true,
            startNode,
            algorithmUsed: useAStar ? 'A-Star' : 'Dijkstra',
            executionTimeMs: executionTimeMs.toFixed(4),
            timeComplexity: "O((V+E) log V)",
            results
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/optimize/update-edge
// Simulated traffic/roadblock injection
router.post('/update-edge', express.json(), (req, res, next) => {
    try {
        const { start, end, addedTime, addedDistance } = req.body;
        
        if (!dataset.edges[start] || !dataset.edges[start][end]) {
             return res.status(400).json({ success: false, message: "Invalid edge specified" });
        }
        
        // Mutate in memory (simulating a DB update)
        dataset.edges[start][end].time += (addedTime || 0);
        dataset.edges[start][end].distance += (addedDistance || 0);
        if ((addedTime || 0) > 0) dataset.edges[start][end].isCongested = true;
        
        // Usually edges are bidirectionally identical, update the reverse too
        if (dataset.edges[end] && dataset.edges[end][start]) {
             dataset.edges[end][start].time += (addedTime || 0);
             dataset.edges[end][start].distance += (addedDistance || 0);
             if ((addedTime || 0) > 0) dataset.edges[end][start].isCongested = true;
        }
        
        res.json({
             success: true,
             message: `Injected roadblock between ${start} and ${end}.`,
             newEdgeState: dataset.edges[start][end]
        });
    } catch (err) {
        next(err);
    }
});

const { optimizeMultiStopRoute } = require('../controllers/tspSolver');

// POST /api/optimize/multi-stop
// Solves Traveling Salesperson for arbitrary coordinates dynamically
router.post('/multi-stop', express.json(), async (req, res, next) => {
    try {
        const { locations } = req.body;
        
        if (!locations || !Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid locations array provided" });
        }
        
        const result = await optimizeMultiStopRoute(locations);
        
        res.json({
            success: true,
            optimizedOrder: result.optimizedOrder,
            totalDistanceMt: result.totalDistanceMt,
            totalDurationSec: result.totalDurationSec
        });
    } catch (err) {
        console.error("Multi-stop route error:", err);
        return res.status(500).json({ success: false, message: "Route optimization failed", error: err.message });
    }
});

module.exports = router;
