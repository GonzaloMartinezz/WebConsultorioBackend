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

// Inicializar Tareas Programadas (Cron Jobs)
const { inicializarCronJobs } = require('./src/services/cronService');
inicializarCronJobs();

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
// Configuración inteligente de CORS
app.use(cors({
  origin: function (origin, callback) {
    // Lista de permitidos exactos
    const permitidos = [
      'http://localhost:5173',
      'https://app-consultorio-odontologico.vercel.app',
      'https://app-consultorio-odontologico-505or6ln5.vercel.app'
    ];

    // Permitimos si no hay origen (postman) 
    // O si está en la lista exacta
    // O (TRUCO MAGICO) si es cualquier link de Vercel que empiece con el nombre de tu app
    if (!origin || permitidos.includes(origin) || (origin.startsWith('https://app-consultorio-odontologico') && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
  credentials: true,
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
app.use('/api/fichas', require('./src/routes/fichaRoutes'));
app.use('/api/estadisticas', require('./src/routes/estadisticasRoutes'));

// ==========================================
// LEVANTAR SERVIDOR
// ==========================================
// Render inyecta su propio puerto en process.env.PORT. 
// Si no existe (como en tu PC), usa el 5000.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
