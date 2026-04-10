const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Proteger rutas (Solo usuarios logueados)
exports.protegerRuta = async (req, res, next) => {
  let token;

  // 1. Buscamos el token en la cabecera (Formato: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Si no hay cabecera, buscamos en la cookie (Compatibilidad anterior)
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      // Verificar y decodificar el token
      const decodificado = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar al usuario en la BD (userId viene del token) y guardarlo en req.usuario
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
