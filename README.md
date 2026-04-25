# CBG Smart Supply Chain System 🌍 (B.Tech Major Project Edition)

An industry-grade logistics and supply chain optimization platform designed for maximum efficiency. This application is deeply tailored for academic presentation, focusing heavily on interactive algorithmic simulations, neural network modeling, and comprehensive analytical proofs.

## 🚀 Key Academic Features

1. **Interactive Traffic Simulation**: Click on any edge/route in the `LiveMap` during a presentation to dynamically simulate a "Traffic Jam." The system processes the weight change in real-time and recalculates alternate pathing instantly. 
2. **Algorithmic Proof Dashboard**: A dedicated page explicitly comparing **Dijkstra's Algorithm** vs **A* (A-Star)** algorithm. It runs live benchmark simulations plotting out the execution time discrepancies in milliseconds to mathematically prove standard $O$-notation complexities.
3. **Formal PDF Report Generation**: The platform integrates `html2canvas` and `jsPDF` to automatically generate formal logistics receipts and demand reports for offline study and documentation.
4. **Environmentally-Aware ML Architecture**: A custom multi-layer Feed-Forward Neural network using `synaptic` that observes distances, weather conditions ("Monsoon"/"Storm"), and local events ("Festivals") to predict node-level demand. 

## 🧠 Algorithmic Concepts Defended

### 1. Distance & Cost Weighting
Instead of solving simply for shortest physical distance, the engine evaluates nodes using continuous continuous factoring variables:
$Cost = (Distance * FuelFactor) + (Time * TimeFactor)$

### 2. Time Complexity Evaluation
*   **Dijkstra's Search**: $O((V+E) \log V)$ - Utilized for evaluating the entire network state and finding valid fallback shortest-paths regardless of coordinate vectors.
*   **A* Search**: $O(E)$ - Highly optimized for Target-to-Target routing by introducing a Euclidean heuristic directing expansion towards physical Lat/Lng endpoints.

## ⚙️ How to Run Locally

### 1. Backend Setup
Navigate into the backend directory and install the necessary dependencies:
```bash
cd backend
npm install
npm start
```
*The backend will automatically start and train the Synaptic ML Model on port 5000.*

### 2. Frontend Setup
Open a new terminal. In the frontend directory, install dependencies and set environment configurations:
```bash
cd frontend
npm install
```
*(Optional) To enable real-world map tiles instead of a missing API key watermark, create a `.env` file in `frontend` and add:*
`VITE_GOOGLE_MAPS_API_KEY=your_key_here`

Run the Vite Dev Server:
```bash
npm run dev
```


