const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
  nombrePaciente: { type: String, required: true },
  apellidoPaciente: { type: String, required: true },
  dni: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String }, // Opcional, por si quieren recordatorio por correo
  profesional: { type: String, required: true }, // "Dr. Adolfo Martínez" o "Dra. Erina Carcara"
  fecha: { type: String, required: true }, // Formato recomendado: YYYY-MM-DD
  hora: { type: String, required: true }, // Formato: "10:30"
  motivo: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Confirmado', 'Cancelado', 'Atendido'], 
    default: 'Pendiente' // Todo turno nuevo entra como pendiente para que el admin lo revise
  }
}, {
  timestamps: true // Guarda la fecha exacta en la que el paciente pidió el turno
});

module.exports = mongoose.model('Turno', turnoSchema);
