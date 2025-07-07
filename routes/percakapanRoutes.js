const {Router} = require('express');
const route = Router();
const percakapanController = require('../controllers/percakapanController');

//get all percakapan
route.get('/api/percakapan', percakapanController.getAllPercakapan);
//get percakapan by id not populated
route.get('/api/percakapan/:id', percakapanController.getPercakapanByIDNotPopulated);

module.exports = route;