const Turno = require('../models/Turno');

// @desc    Crear un nuevo turno solicitado por un paciente
// @route   POST /api/turnos
// @access  Público (Cualquiera puede pedir un turno desde la web)
exports.crearTurno = async (req, res) => {
  try {
    const nuevoTurno = new Turno(req.body);
    const turnoGuardado = await nuevoTurno.save();
    
    res.status(201).json({ 
      mensaje: 'Turno solicitado con éxito. Aguarde confirmación.', 
      turno: turnoGuardado 
    });
  } catch (error) {
    res.status(400).json({ error: 'Error al solicitar el turno', detalle: error.message });
  }
};

// @desc    Obtener todos los turnos (Para llenar la tabla del AdminDashboard)
// @route   GET /api/turnos
// @access  Privado (Solo Admin)
exports.obtenerTurnos = async (req, res) => {
  try {
    // Busca todos los turnos y los ordena por fecha y hora
    const turnos = await Turno.find().sort({ fecha: 1, hora: 1 });
    res.status(200).json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los turnos' });
  }
};

// @desc    Actualizar el estado de un turno (Aceptar o Rechazar)
// @route   PATCH /api/turnos/:id/estado
// @access  Privado (Solo Admin)
exports.actualizarEstadoTurno = async (req, res) => {
  try {
    const { estado } = req.body; // Recibirá 'Confirmado', 'Cancelado', etc.
    const turnoId = req.params.id;

    // Validar que el estado sea permitido
    if (!['Pendiente', 'Confirmado', 'Cancelado', 'Atendido'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const turnoActualizado = await Turno.findByIdAndUpdate(
      turnoId, 
      { estado }, 
      { new: true } // Para que devuelva el turno ya modificado
    );

    if (!turnoActualizado) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Aquí (en el futuro) iría el código para enviar el WhatsApp/Email de confirmación

    res.status(200).json({ 
      mensaje: `Turno marcado como ${estado}`, 
      turno: turnoActualizado 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado', detalle: error.message });
  }
};

// @desc    Obtener turnos de un paciente específico por su nombre
// @route   GET /api/turnos/paciente/:nombre/:apellido
exports.obtenerMisTurnos = async (req, res) => {
  try {
    const { nombre, apellido } = req.params;
    // Buscamos los turnos que coincidan exactamente con el nombre y apellido del paciente logueado
    const misTurnos = await Turno.find({ 
      nombrePaciente: nombre, 
      apellidoPaciente: apellido 
    }).sort({ createdAt: -1 }); // Los ordenamos del más nuevo al más viejo
    
    res.status(200).json(misTurnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar los turnos del paciente' });
  }
};
