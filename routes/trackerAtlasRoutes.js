const {Router} = require('express');
const route = Router();
const trackerAtlasController = require('../controllers/trackerAtlasController');

//get all tracker
route.get('/api/atlas/tracker', trackerAtlasController.getAll);
route.get('/api/atlas/tracker/normal', trackerAtlasController.getNormal);
route.get('/api/atlas/tracker/fallback', trackerAtlasController.getFallback);

//delete tracker
route.delete('/api/atlas/tracker', trackerAtlasController.delete);

//delete all tracker
route.delete('/api/atlas/tracker/all', trackerAtlasController.deleteAll);

//get tracker by id
route.get('/api/atlas/tracker/:id', trackerAtlasController.getById);


module.exports = route;