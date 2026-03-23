const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const conectarDB = require('./src/config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a Base de Datos
conectarDB();

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
// Configuración estricta de CORS para permitir cookies desde el Frontend
app.use(cors({
  origin: process.env.FRONTEND_URL, // Tu dominio de React/Vercel
  credentials: true, // Crucial para enviar y recibir cookies (JWT)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

app.use(express.json()); // Permite recibir JSON en los req.body
app.use(cookieParser()); // Permite leer cookies
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Muestra las peticiones en la consola
}

// ==========================================
// RUTAS DE LA API (Endpoints)
// ==========================================
app.get('/', (req, res) => {
  res.send('API del Centro Odontológico C&M funcionando 🚀');
});

// Aquí luego conectaremos:
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/turnos', require('./src/routes/turnoRoutes'));
app.use('/api/pacientes', require('./src/routes/pacienteRoutes'));

// ==========================================
// LEVANTAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});
