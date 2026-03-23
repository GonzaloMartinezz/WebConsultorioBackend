const express = require('express');
const router = express.Router();
const { 
  crearPaciente, 
  obtenerPacientes, 
  actualizarDiente, 
  agregarHistoria 
} = require('../controllers/pacienteController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

// Todas las rutas de pacientes requieren estar logueado y ser Admin
router.use(protegerRuta, adminRole); 

router.post('/', crearPaciente);
router.get('/', obtenerPacientes);
router.patch('/:id/odontograma', actualizarDiente);
router.post('/:id/historia', agregarHistoria);

module.exports = router;
