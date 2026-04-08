const express = require('express');
const router = express.Router();
const fichaController = require('../controllers/fichaController');

// Obtener ficha del paciente
router.get('/:id', fichaController.obtenerFicha);

// Actualizar ficha (odontograma + historial)
router.put('/:id', fichaController.actualizarFicha);

module.exports = router;
