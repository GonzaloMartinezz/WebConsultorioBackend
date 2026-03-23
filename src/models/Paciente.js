const mongoose = require('mongoose');

// Sub-esquema para el Odontograma (Cada diente es un objeto)
const dienteSchema = new mongoose.Schema({
  numero: { type: Number, required: true }, // Ej: 18, 21, 45
  estado: { type: String, default: 'Sano' }, // Sano, Cariado, Obturado, Ausente, etc.
  notas: { type: String } // "Se aplicó composite color A2"
}, { _id: false }); // _id: false evita que Mongoose le cree un ID a cada diente

// Sub-esquema para la Historia Clínica General
const evolucionSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  profesional: { type: String, required: true },
  tratamiento: { type: String, required: true }
});

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  dni: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  email: { type: String },
  fechaNacimiento: { type: String },
  estado: { 
    type: String, 
    enum: ['Tratamiento Activo', 'Alta', 'Inactivo'], 
    default: 'Tratamiento Activo' 
  },
  // Aquí anidamos el odontograma y la historia
  odontograma: [dienteSchema],
  historiaClinica: [evolucionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Paciente', pacienteSchema);
