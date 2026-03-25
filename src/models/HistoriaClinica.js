const mongoose = require('mongoose');

const historiaSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Lo enlazamos con el paciente registrado
    required: true,
    unique: true // Cada paciente tiene solo UNA historia clínica
  },
  // Aquí guardaremos el estado de cada diente que toquen en React
  odontograma: [{
    diente: { type: Number, required: true }, // Ej: 18, 21, 46
    diagnostico: { type: String, required: true }, // Ej: 'Caries', 'Extracción', 'Sano'
    fecha: { type: Date, default: Date.now }
  }],
  observacionesGenerales: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('HistoriaClinica', historiaSchema);
