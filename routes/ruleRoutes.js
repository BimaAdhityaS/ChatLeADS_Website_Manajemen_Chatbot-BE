const {Router} = require('express');
const route = Router();
const ruleController = require('../controllers/ruleController');

//get all rules
route.get('/api/rule', ruleController.getAllRule);
//get rule by id
route.get('/api/rule/:id', ruleController.getRuleByID);
//create new rule
route.post('/api/rule', ruleController.createRule);
//update rule
route.patch('/api/rule/:id', ruleController.updateRule);
//delete rule
route.delete('/api/rule/:id', ruleController.deleteRule);

module.exports = route;