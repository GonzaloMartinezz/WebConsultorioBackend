const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Proteger rutas (Solo usuarios logueados)
exports.protegerRuta = async (req, res, next) => {
  let token;

  // 1. Buscamos el token ÚNICAMENTE en la cabecera (Formato: Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 

  if (token) {
    try {
      // Verificar y decodificar el token
      const decodificado = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar al usuario en la BD (userId viene del token)
      // Nota: Mantenemos decodificado.userId para que sea compatible con generateToken.js
      req.usuario = await Usuario.findById(decodificado.userId).select('-password');
      
      if (!req.usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado en el sistema' });
      }

      next(); // Lo dejamos pasar
    } catch (error) {
      console.error("Error al verificar token:", error);
      res.status(401).json({ error: 'No autorizado, token fallido o expirado' });
    }
  } else {
    res.status(401).json({ error: 'No autorizado, no hay token o el formato es inválido' });
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
