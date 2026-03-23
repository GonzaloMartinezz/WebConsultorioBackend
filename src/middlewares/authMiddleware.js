const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Proteger rutas (Solo usuarios logueados)
exports.protegerRuta = async (req, res, next) => {
  let token = req.cookies.jwt; // Leemos la cookie

  if (token) {
    try {
      // Verificar y decodificar el token
      const decodificado = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar al usuario en la BD (sin traer la contraseña) y guardarlo en req.usuario
      req.usuario = await Usuario.findById(decodificado.userId).select('-password');
      next(); // Pasa al siguiente controlador (Lo deja entrar)
    } catch (error) {
      res.status(401).json({ error: 'No autorizado, token fallido o expirado' });
    }
  } else {
    res.status(401).json({ error: 'No autorizado, no hay token' });
  }
};

// Verificar si el usuario es Administrador
exports.adminRole = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    next(); // Lo deja entrar
  } else {
    res.status(403).json({ error: 'No tienes permisos de Administrador' });
  }
};
