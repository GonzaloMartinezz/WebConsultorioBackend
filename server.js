const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

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
// Lista exacta de orígenes permitidos (local + Vercel)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://app-consultorio-odontologico.vercel.app'
  ],
  credentials: true, // ESTO ES LO ÚNICO QUE PERMITE INICIAR SESIÓN
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
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
app.use('/api/historias', require('./src/routes/historiaRoutes'));

// ==========================================
// LEVANTAR SERVIDOR
// ==========================================
// Render inyecta su propio puerto en process.env.PORT. 
// Si no existe (como en tu PC), usa el 5000.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
