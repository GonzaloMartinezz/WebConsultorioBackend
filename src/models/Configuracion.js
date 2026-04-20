const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema({
  horarios: {
    apertura: { type: String, default: '09:00' },
    cierre: { type: String, default: '18:00' },
    intervalo: { type: String, default: '30' }
  },
  servicios: [
    {
      nombre: { type: String, required: true },
      duracion: { type: Number, default: 30 }
    }
  ],
  whatsappTemplate: { type: String, default: 'Hola [PACIENTE], recordatorio de tu turno el [FECHA] a las [HORA] hs.' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Configuracion', configuracionSchema);
