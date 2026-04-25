const express = require('express');
const router = express.Router();
const dataset = require('../data/dataset.json');
const fs = require('fs');
const path = require('path');

// GET /api/suppliers
router.get('/', (req, res) => {
    res.json(dataset.suppliers);
});

// POST /api/suppliers
router.post('/', (req, res) => {
    const { name, location, wasteQuantity, lat, lng } = req.body;
    
    if(!name || !location || wasteQuantity === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newSupplier = {
        id: dataset.suppliers.length > 0 ? dataset.suppliers[dataset.suppliers.length - 1].id + 1 : 1,
        name,
        location,
        wasteQuantity: Number(wasteQuantity),
        status: "Pending" // Adding status matching the dataset
    };

    dataset.suppliers.push(newSupplier);

    // Dynamic Map Genesis Feature
    if (!dataset.nodes[location]) {
        const spawnLat = lat ? Number(lat) : Number((28.55 + Math.random() * 0.1).toFixed(4));
        const spawnLng = lng ? Number(lng) : Number((77.15 + Math.random() * 0.1).toFixed(4));

        dataset.nodes[location] = {
            "lat": spawnLat,
            "lng": spawnLng,
            "type": "village",
            "status": "uncollected",
            "demandLevel": "High"
        };
        
        // Approximate Euclidean edge generation to main Plant
        const dLat = (dataset.nodes["Plant"].lat - spawnLat) * 111;
        const dLng = (dataset.nodes["Plant"].lng - spawnLng) * 111;
        const approxDistKm = Math.max(5, Math.floor(Math.sqrt(dLat*dLat + dLng*dLng)));
        const approxTimeMin = Math.floor(approxDistKm * 1.5); 
        
        dataset.edges["Plant"][location] = { "distance": approxDistKm, "time": approxTimeMin };
        dataset.edges[location] = {
             "Plant": { "distance": approxDistKm, "time": approxTimeMin }
        };

        // Persist DB structurally
        try {
           fs.writeFileSync(path.join(__dirname, '../data/dataset.json'), JSON.stringify(dataset, null, 2));
        } catch (e) {
           console.error("Failed to persist dynamic map node:", e);
        }
    }

    res.status(201).json(newSupplier);
});

module.exports = router;
