const {Router} = require('express');
const route = Router();
const rasaPrepController = require('../controllers/rasaPrepController');

// generate training data yaml
route.get('/api/rasa/generate-training-data-yaml', rasaPrepController.generateYamlTrainingData);

module.exports = route;