const express = require('express');
const router = express.Router();
const { crearTurno, obtenerTurnos, actualizarEstadoTurno, obtenerMisTurnos, eliminarTurno } = require('../controllers/turnoController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

// Ruta Pública: Un paciente pide el turno
router.post('/', crearTurno);

// Rutas Privadas: Solo el usuario logueado con rol 'admin' puede ejecutar esto
router.get('/', protegerRuta, adminRole, obtenerTurnos);
router.patch('/:id/estado', protegerRuta, adminRole, actualizarEstadoTurno);
router.delete('/:id', protegerRuta, adminRole, eliminarTurno);

// Agrega esta nueva ruta (puede ser pública o protegida, la dejaremos abierta para el paciente por ahora):
router.get('/paciente/:nombre/:apellido', obtenerMisTurnos);

module.exports = router;
