const express = require('express');
const router = express.Router();
const fichaController = require('../controllers/fichaController');

// Obtener ficha del paciente
router.get('/:id', fichaController.obtenerFicha);

// Actualizar ficha (odontograma + historial)
router.put('/:id', fichaController.actualizarFicha);

// Eliminar consulta del historial
router.delete('/:id/historial/:consultaId', fichaController.eliminarConsultaHistorial);

// Editar consulta del historial
router.put('/:id/historial/:consultaId', fichaController.editarConsultaHistorial);

module.exports = router;
