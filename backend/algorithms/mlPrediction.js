const synaptic = require('synaptic');
const dataset = require('../data/dataset.json');

// Initialize a simple Feed-forward Neural Network
// Inputs: [IsVillage, DistanceToPlant, WeatherSeverity, IsFestival]
// Output: [DemandHigh, DemandMedium, DemandLow]
const Layer = synaptic.Layer;
const Network = synaptic.Network;
const Trainer = synaptic.Trainer;

const inputLayer = new Layer(4); // Increased to 4 inputs
const hiddenLayer = new Layer(6);
const outputLayer = new Layer(3);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

const demandNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});

const trainer = new Trainer(demandNetwork);

let isTrained = false;

function trainModel() {
    const trainingSet = [
        // [IsVillage, Dist, SevereWeather, Festival] -> [High, Medium, Low]
        { input: [1, 0.1, 0, 0], output: [1, 0, 0] }, // High demand (close)
        { input: [1, 0.5, 0, 0], output: [0, 1, 0] }, // Medium demand
        { input: [1, 0.9, 0, 0], output: [0, 0, 1] }, // Low demand

        // Environmental Overrides
        { input: [1, 0.9, 1, 0], output: [1, 0, 0] }, // Storms spike demand even if far
        { input: [1, 0.5, 0, 1], output: [1, 0, 0] }, // Festivals spike demand massively

        { input: [0, 0.0, 0, 0], output: [0, 0, 1] }, // Plant (no demand)
    ];

    trainer.train(trainingSet, {
        rate: .1,
        iterations: 8000,
        error: .005,
        shuffle: true,
        log: 0
    });
    isTrained = true;
    console.log("ML Demand Prediction Model Trained with Environmental Factors.");
}

function predictDemand(nodeName) {
    if (!isTrained) trainModel();

    const node = dataset.nodes[nodeName];
    if (!node) return "Unknown";

    // Feature Extraction
    const isVillage = node.type === "village" ? 1 : 0;
    const randomDistanceMock = Math.random();
    const env = dataset.environment || { weather: "Clear", festival: false };

    // Normalize weather
    const severeWeather = (env.weather === "Monsoon" || env.weather === "Storm") ? 1 : 0;
    const isFestival = env.festival ? 1 : 0;

    const result = demandNetwork.activate([isVillage, randomDistanceMock, severeWeather, isFestival]);

    let maxLabel = "Low";
    if (result[0] > result[1] && result[0] > result[2]) maxLabel = "High";
    else if (result[1] > result[0] && result[1] > result[2]) maxLabel = "Medium";

    return maxLabel;
}

// Automatically train model asynchronously when this module is loaded
setTimeout(trainModel, 100);

module.exports = { predictDemand };
