const express = require('express');
const router = express.Router();
const { getHistoriaByPaciente, updateOdontograma, updateNotas } = require('../controllers/historiaController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

// Rutas protegidas (Solo Odontólogos/Admin)
router.get('/:id', protegerRuta, adminRole, getHistoriaByPaciente);
router.put('/:id/odontograma', protegerRuta, adminRole, updateOdontograma);
router.put('/:id/notas', protegerRuta, adminRole, updateNotas);

module.exports = router;
