const express = require('express');
const router = express.Router();
const dataset = require('../data/dataset.json');
const { predictDemand } = require('../algorithms/mlPrediction');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/analytics
router.get('/', (req, res) => {
    res.json(dataset.analytics);
});

// GET /api/analytics/network
// Optional: add `protect` middleware here later if needed to lock it down
router.get('/network', (req, res) => {
    // Add real-time ML prediction to nodes
    const enrichedNodes = { ...dataset.nodes };
    for (const nodeKey in enrichedNodes) {
        if (enrichedNodes[nodeKey].type === 'village') {
             enrichedNodes[nodeKey].predictedDemand = predictDemand(nodeKey);
        }
    }

    res.json({
        success: true,
        nodes: enrichedNodes,
        edges: dataset.edges,
        vehicles: dataset.vehicles
    });
});

module.exports = router;
