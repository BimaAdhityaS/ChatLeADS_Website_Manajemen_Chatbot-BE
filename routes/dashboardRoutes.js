const {Router} = require('express');
const route = Router();
const dashboardController = require('../controllers/dashboardController');

// Fetch all dashboard data
route.get('/api/dashboard', dashboardController.getDashboardData);
// Fetch tracker data for Atlas
route.get('/api/atlas/dashboard', dashboardController.getDashboardDataAtlas);

module.exports = route;