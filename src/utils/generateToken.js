const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // Creamos el token que dura 30 días
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  // Guardamos el token en una cookie segura
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // true en producción (HTTPS)
    sameSite: 'strict', // Previene ataques CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días en milisegundos
  });
};

module.exports = generateToken;
