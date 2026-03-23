const Usuario = require('../models/Usuario');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/registrar
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear el usuario
    const usuario = await Usuario.create({ nombre, apellido, email, password, rol });

    if (usuario) {
      // Generar Token y Cookie
      generateToken(res, usuario._id);
      res.status(201).json({
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
};

// @desc    Autenticar usuario y conseguir token (Login)
// @route   POST /api/auth/login
exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar al usuario por email
    const usuario = await Usuario.findOne({ email });

    // Verificar si existe y si la contraseña coincide
    if (usuario && (await usuario.coincidePassword(password))) {
      generateToken(res, usuario._id);
      
      res.status(200).json({
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      });
    } else {
      res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Cerrar sesión (Borrar Cookie)
// @route   POST /api/auth/logout
exports.logoutUsuario = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0) // Hacemos expirar la cookie instantáneamente
  });
  res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
};
