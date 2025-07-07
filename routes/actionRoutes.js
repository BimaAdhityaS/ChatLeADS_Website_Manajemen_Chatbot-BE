const {Router} = require('express');
const route = Router();
const actionController = require('../controllers/actionController');
const { upload } = require("../config/cloudinary");

route.get('/api/action', actionController.getAllAction);
route.get('/api/action/:id', actionController.getActionById);

//create new action
route.post('/api/action', upload.single('file'), actionController.createAction);
//update action
route.patch('/api/action/:id', upload.single('file') , actionController.updateAction);  

//delete action
route.delete('/api/action/:id', actionController.deleteAction);

module.exports = route;