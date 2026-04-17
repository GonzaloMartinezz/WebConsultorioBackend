const Usuario = require('../models/Usuario');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/registrar
exports.registrarUsuario = async (req, res) => {
  try {
    let { nombre, apellido, email, password, rol } = req.body;
    email = email.toLowerCase(); // Normalizamos el correo

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

    // 1. NORMALIZACIÓN: Convertimos el email a minúsculas siempre y quitamos espacios. 
    const emailNormalizado = email?.toLowerCase().trim();

    // 2. IDENTIFICACIÓN: Buscamos en la base de datos
    const usuario = await Usuario.findOne({ email: emailNormalizado });
    
    if (!usuario) {
      return res.status(400).json({ error: 'No existe una cuenta con este correo electrónico.' });
    }

    // 3. CORROBORACIÓN: Comparamos la contraseña encriptada (usamos el método del modelo o bcrypt)
    const passwordCorrecta = await usuario.coincidePassword(password);
    
    if (!passwordCorrecta) {
      return res.status(400).json({ error: 'Contraseña incorrecta. Inténtalo de nuevo.' });
    }

    // 4. CREACIÓN DEL PASE (Token)
    // Guardamos el ID en el payload para que el middleware pueda identificar al usuario
    const payload = {
      userId: usuario._id,
      rol: usuario.rol
    };

    // Firmamos el token (30 días de duración)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    // 5. RESPUESTA LIMPIA: Devolvemos el token y los datos del usuario
    res.status(200).json({
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error("Error en el loginUsuario:", error);
    res.status(500).json({ error: 'Hubo un error en el servidor, intenta nuevamente.' });
  }
};

// @desc    Cerrar sesión y destruir la cookie
// @route   POST /api/auth/logout
exports.logoutUsuario = (req, res) => {
  // Sobrescribimos la cookie actual con una vacía que expira en 1 segundo
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0)
  });
  res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
};

// @desc    Obtener todos los usuarios que son pacientes
// @route   GET /api/auth/pacientes
exports.obtenerPacientes = async (req, res) => {
  try {
    // Buscamos solo a los que tienen rol de 'paciente' y excluimos la contraseña por seguridad
    const pacientes = await Usuario.find({ rol: 'paciente' }).select('-password');
    res.status(200).json(pacientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al obtener los pacientes' });
  }
};

// @desc    Actualizar contraseña (Olvidé mi clave)
// @route   POST /api/auth/recuperar-password
exports.recuperarPassword = async (req, res) => {
  try {
    const { email, nuevaPassword } = req.body;
    
    // Convertimos a minúscula para evitar errores
    const correoNormalizado = email.toLowerCase(); 

    // Buscamos al usuario
    const usuario = await Usuario.findOne({ email: correoNormalizado });
    if (!usuario) {
      return res.status(404).json({ error: 'No existe una cuenta con este correo.' });
    }

    // Encriptamos la nueva clave y guardamos
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
};

// @desc    Login / Registro con Google
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({ error: 'Token de Google no proporcionado' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub } = payload;

    // Buscar si el usuario ya existe por email
    let usuario = await Usuario.findOne({ email: email.toLowerCase() });

    if (!usuario) {
      // Si no existe, lo creamos como paciente por defecto
      usuario = await Usuario.create({
        nombre: given_name || 'Usuario',
        apellido: family_name || 'Google',
        email: email.toLowerCase(),
        password: sub, // Usamos el ID de Google como password inicial (será hasheado por el modelo)
        rol: 'paciente'
      });
    }

    // Generar el token JWT para nuestra App
    const token = jwt.sign(
      { userId: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error en Google Auth:", error);
    res.status(400).json({ error: 'Fallo la autenticación con Google' });
  }
};
