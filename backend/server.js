const express = require('express');
const cors = require('cors');

const optimizeRoutes = require('./routes/optimize');
const suppliersRoutes = require('./routes/suppliers');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth'); // NEW
const { errorHandler, notFoundError } = require('./middlewares/errorHandler'); // NEW

// Initialize ML implicitly requiring it
require('./algorithms/mlPrediction');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // NEW
app.use('/api/optimize', optimizeRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Smart CBG Supply Chain Optimization Platform API is Running (Industry Grade)');
});

// Capture 404
app.use(notFoundError);
// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
