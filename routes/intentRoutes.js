const {Router} = require('express');
const route = Router();
const intentController = require('../controllers/intentController');

//get all intents
route.get('/api/intent', intentController.getAll);
//get intent by id
route.get('/api/intent/:id', intentController.getById);
//create new intent
route.post('/api/intent', intentController.create);
//update intent
route.patch('/api/intent/:id', intentController.update);
//delete intent
route.delete('/api/intent/:id', intentController.delete);

module.exports = route;