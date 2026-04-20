const express = require('express');
const router = express.Router();
const { obtenerConfiguracion, actualizarConfiguracion } = require('../controllers/configuracionController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

router.get('/', protegerRuta, obtenerConfiguracion);
router.put('/', protegerRuta, adminRole, actualizarConfiguracion);

module.exports = router;
