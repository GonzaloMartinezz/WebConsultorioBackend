const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // Creamos el token que dura 30 días
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  // Guardamos el token en una cookie segura
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,            // ¡NUEVO! Obliga a usar HTTPS
    sameSite: 'none',        // ¡NUEVO! Permite que la cookie viaje de Render a Vercel
    maxAge: 30 * 24 * 60 * 60 * 1000 
  });
};

module.exports = generateToken;
