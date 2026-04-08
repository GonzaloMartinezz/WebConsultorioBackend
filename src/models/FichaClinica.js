const mongoose = require('mongoose');

const FichaClinicaSchema = new mongoose.Schema({
  pacienteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true, 
    unique: true 
  },
  odontograma: [{
    diente: Number,
    estado: { type: String, default: 'sano' },
    notas: String
  }],
  historialConsultas: [{
    fecha: { type: Date, default: Date.now },
    motivo: String,
    profesional: String,
    tratamientoRealizado: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('FichaClinica', FichaClinicaSchema);
