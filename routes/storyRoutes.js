const {Router} = require('express');
const route = Router();
const storyController = require('../controllers/storyController');

//get all stories
route.get('/api/story', storyController.getAllStory);
//get story by id
route.get('/api/story/:id', storyController.getStoryById);
//create new story
route.post('/api/story', storyController.createStory);
//update story
route.patch('/api/story/:id', storyController.updateStory);
//delete story
route.delete('/api/story/:id', storyController.deleteStory);

module.exports = route;
