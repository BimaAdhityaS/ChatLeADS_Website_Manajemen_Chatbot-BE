const {Router} = require('express');
const route = Router();
const trackerController = require('../controllers/trackerController');

//get all tracker
route.get('/api/tracker', trackerController.getAll);
route.get('/api/tracker/normal', trackerController.getNormal);
route.get('/api/tracker/fallback', trackerController.getFallback);

//delete tracker
route.delete('/api/tracker', trackerController.delete);

//delete all tracker
route.delete('/api/tracker/all', trackerController.deleteAll);

//get tracker by id
route.get('/api/tracker/:id', trackerController.getById);


module.exports = route;