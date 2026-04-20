const express = require('express');
const router = express.Router();
const { enviarRecordatoriosMañana } = require('../controllers/notificacionesController');
const { protegerRuta, adminRole } = require('../middlewares/authMiddleware');

router.post('/recordatorios-manana', protegerRuta, adminRole, enviarRecordatoriosMañana);

module.exports = router;
