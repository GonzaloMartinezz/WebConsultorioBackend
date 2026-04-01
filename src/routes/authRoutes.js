const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, logoutUsuario, obtenerPacientes } = require('../controllers/authController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

router.post('/registrar', registrarUsuario); // Ruta en español (compatibilidad)
router.post('/register', registrarUsuario);  // Alias en inglés (para el Frontend)
router.post('/login', loginUsuario);
router.post('/logout', logoutUsuario);
router.get('/pacientes', protegerRuta, adminRole, obtenerPacientes);

// Ejemplo de ruta que solo puede ver alguien logueado (Para probar)
router.get('/perfil', protegerRuta, (req, res) => {
  res.status(200).json(req.usuario);
});

module.exports = router;
