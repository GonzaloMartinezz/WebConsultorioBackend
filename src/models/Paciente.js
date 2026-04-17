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
  tratamiento: { type: String, required: true },
  archivos: [String] // URLs de Cloudinary o S3
});

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String }, // Opcional para registros rápidos
  dni: { type: String, sparse: true, unique: true }, // Sparse permite múltiples nulls sin romper el unique
  telefono: { type: String }, // Opcional para registros rápidos
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
