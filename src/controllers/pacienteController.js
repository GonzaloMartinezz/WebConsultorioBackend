const Paciente = require('../models/Paciente');

// @desc    Crear un nuevo paciente
// @route   POST /api/pacientes
exports.crearPaciente = async (req, res) => {
  try {
    const paciente = new Paciente(req.body);
    const pacienteGuardado = await paciente.save();
    res.status(201).json(pacienteGuardado);
  } catch (error) {
    if(error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un paciente con este DNI' });
    }
    res.status(400).json({ error: 'Error al crear paciente', detalle: error.message });
  }
};

// @desc    Obtener todos los pacientes (Para la tabla de tu Admin)
// @route   GET /api/pacientes
exports.obtenerPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find().sort({ updatedAt: -1 });
    res.status(200).json(pacientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

// @desc    Actualizar un Diente en el Odontograma
// @route   PATCH /api/pacientes/:id/odontograma
exports.actualizarDiente = async (req, res) => {
  try {
    const { numero, estado, notas } = req.body;
    const paciente = await Paciente.findById(req.params.id);

    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    // Buscamos si el diente ya tiene algún registro previo
    const indexDiente = paciente.odontograma.findIndex(d => d.numero === parseInt(numero));

    if (indexDiente >= 0) {
      // Si el diente ya existía, lo actualizamos
      paciente.odontograma[indexDiente].estado = estado || paciente.odontograma[indexDiente].estado;
      paciente.odontograma[indexDiente].notas = notas || paciente.odontograma[indexDiente].notas;
    } else {
      // Si es la primera vez que tocamos este diente, lo agregamos al array
      paciente.odontograma.push({ numero, estado, notas });
    }

    await paciente.save();
    res.status(200).json({ mensaje: 'Odontograma actualizado', odontograma: paciente.odontograma });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar diente', detalle: error.message });
  }
};

// @desc    Agregar evolución a la historia clínica
// @route   POST /api/pacientes/:id/historia
exports.agregarHistoria = async (req, res) => {
  try {
    const { profesional, tratamiento } = req.body;
    const paciente = await Paciente.findById(req.params.id);

    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    // Empujamos la nueva nota al inicio del array
    paciente.historiaClinica.unshift({ profesional, tratamiento });
    
    await paciente.save();
    res.status(200).json({ mensaje: 'Historia actualizada', historia: paciente.historiaClinica });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar historia', detalle: error.message });
  }
};
// @desc    Eliminar un paciente definitivamente y sus turnos
// @route   DELETE /api/pacientes/:id
exports.eliminarPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    // 1. Eliminar turnos vinculados a este paciente
    // En el modelo de Turno, el campo se llama 'pacienteId'
    const Turno = require('../models/Turno');
    await Turno.deleteMany({ pacienteId: req.params.id });

    // 2. Eliminar la Ficha Clínica asociada si existiera
    const FichaClinica = require('../models/FichaClinica');
    await FichaClinica.findOneAndDelete({ pacienteId: req.params.id });

    // 3. Eliminar finalmente el modelo del Paciente
    await Paciente.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ mensaje: 'Paciente y todos sus registros (turnos y ficha) fueron eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar paciente y sus datos vinculados', detalle: error.message });
  }
};
