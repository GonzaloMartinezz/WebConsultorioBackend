const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['paciente', 'admin'], 
    default: 'paciente' 
  }
}, {
  timestamps: true
});

// Middleware de Mongoose: Antes de guardar, encriptar la contraseña
usuarioSchema.pre('save', async function(next) {
  // Si la contraseña no se modificó, no la volvemos a encriptar
  if (!this.isModified('password')) {
    next();
  }
  // Generamos la "sal" y encriptamos
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar la contraseña ingresada en el login con la encriptada
usuarioSchema.methods.coincidePassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
