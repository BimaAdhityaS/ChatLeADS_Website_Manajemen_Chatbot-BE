const {Router} = require('express');
const route = Router();
const riwayatPelatihanController = require('../controllers/riwayatPelatihanController');

// Get all riwayat pelatihan
route.get('/api/riwayat-pelatihan', riwayatPelatihanController.getAllRiwayatPelatihan);

// Create new riwayat pelatihan
route.post('/api/riwayat-pelatihan', riwayatPelatihanController.createRiwayatPelatihan);

module.exports = route;