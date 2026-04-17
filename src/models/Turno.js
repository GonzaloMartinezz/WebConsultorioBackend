const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
  // Relacionamos el turno con un paciente registrado en la colección Pacientes
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },

  // Datos en crudo: siempre se guardan por si el paciente es nuevo y aún no tiene ficha
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
    enum: ['Pendiente', 'Confirmado', 'Cancelado', 'Atendido', 'Completado', 'Finalizado'], 
    default: 'Pendiente' // Todo turno nuevo entra como pendiente para que el admin lo revise
  },

  // Notas que el doctor agrega DESPUÉS de la consulta (Historia Clínica rápida)
  notasConsulta: { type: String, default: '' }
}, {
  timestamps: true // Guarda la fecha exacta en la que el paciente pidió el turno
});

module.exports = mongoose.model('Turno', turnoSchema);
