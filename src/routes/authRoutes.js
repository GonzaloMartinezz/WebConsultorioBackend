const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, logoutUsuario } = require('../controllers/authController');
const { protegerRuta } = require('../middlewares/authMiddleware');

router.post('/registrar', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/logout', logoutUsuario);

// Ejemplo de ruta que solo puede ver alguien logueado (Para probar)
router.get('/perfil', protegerRuta, (req, res) => {
  res.status(200).json(req.usuario);
});

module.exports = router;
