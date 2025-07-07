const {Router} = require('express');
const route = Router();
const utteranceController = require('../controllers/utteranceController');

//get all utterances
route.get('/api/utterance', utteranceController.getAll);
//get utterance by id
route.get('/api/utterance/:id', utteranceController.getById);
//create new utterance
route.post('/api/utterance', utteranceController.create);
//update utterance
route.patch('/api/utterance/:id', utteranceController.update);
//delete utterance
route.delete('/api/utterance/:id', utteranceController.delete);

module.exports = route;
