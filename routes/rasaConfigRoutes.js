const {Router} = require('express');
const route = Router();
const rasaConfigController = require('../controllers/rasaConfigController');

// GET config
route.get('/api/rasa/config', rasaConfigController.getConfig);
// UPDATE only numeric values
route.patch('/api/rasa/config', rasaConfigController.updateConfig);

module.exports = route;