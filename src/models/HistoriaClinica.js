const mongoose = require('mongoose');

const HistoriaClinicaSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true // Cada paciente tiene solo UNA historia clínica
  },
  contadorVisitas: { type: Number, default: 0 },
  odontograma: [
    {
      idDiente: Number, // 11, 12, 48, etc. (nomenclatura FDI)
      estado: { type: String, default: 'sano' }, // 'caries', 'ausente', 'implante', 'corona', etc.
      notas: String
    }
  ],
  archivos: [
    {
      nombre: String,
      url: String,
      fecha: { type: Date, default: Date.now }
    }
  ],
  notasGenerales: { type: String, default: '' },
  ultimaActualizacion: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('HistoriaClinica', HistoriaClinicaSchema);
