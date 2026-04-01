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
// 1. Lista VIP de orígenes permitidos (local + producción en Vercel)
const origenesPermitidos = [
  'http://localhost:5173',
  'https://app-consultorio-odontologico.vercel.app'
];

// 2. Guardia de seguridad inteligente con lista dinámica
app.use(cors({
  origin: function (origin, callback) {
    // Permite Postman/herramientas sin origen, o si está en la lista VIP
    if (!origin || origenesPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
  credentials: true, // ¡VITAL para que las cookies viajen entre dominios!
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
