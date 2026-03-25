const express = require('express');
const router = express.Router();
const { obtenerHistoria, actualizarDiente } = require('../controllers/historiaController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

// Rutas protegidas (Solo Odontólogos/Admin)
router.get('/:idPaciente', protegerRuta, adminRole, obtenerHistoria);
router.post('/:idPaciente/diente', protegerRuta, adminRole, actualizarDiente);

module.exports = router;
