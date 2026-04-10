const express = require('express');
const router = express.Router();
const { obtenerEstadisticas } = require('../controllers/estadisticasController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

// Ruta protegida para el Admin
router.get('/', protegerRuta, adminRole, obtenerEstadisticas);

module.exports = router;
