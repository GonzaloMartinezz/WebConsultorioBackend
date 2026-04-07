const HistoriaClinica = require('../models/HistoriaClinica');

// @desc    Obtener historia clínica por ID de paciente (o crearla si no existe)
// @route   GET /api/historias/:id
// @access  Privado (Admin)
exports.getHistoriaByPaciente = async (req, res) => {
  try {
    let historia = await HistoriaClinica.findOne({ paciente: req.params.id });

    if (!historia) {
      // Si no existe, la creamos vacía en el momento (legajo digital nuevo)
      historia = await HistoriaClinica.create({ paciente: req.params.id, odontograma: [] });
    }

    // Incrementamos el contador cada vez que el admin abre su ficha
    historia.contadorVisitas += 1;
    await historia.save();

    res.status(200).json(historia);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la historia clínica' });
  }
};

// @desc    Actualizar el odontograma completo de un paciente
// @route   PUT /api/historias/:id/odontograma
// @access  Privado (Admin)
exports.updateOdontograma = async (req, res) => {
  try {
    const { odontograma } = req.body;
    const historia = await HistoriaClinica.findOneAndUpdate(
      { paciente: req.params.id },
      { odontograma, ultimaActualizacion: Date.now() },
      { new: true }
    );

    if (!historia) {
      return res.status(404).json({ error: 'Historia clínica no encontrada' });
    }

    res.status(200).json(historia);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el odontograma' });
  }
};

// @desc    Actualizar notas generales de la historia clínica
// @route   PUT /api/historias/:id/notas
// @access  Privado (Admin)
exports.updateNotas = async (req, res) => {
  try {
    const { notasGenerales } = req.body;
    const historia = await HistoriaClinica.findOneAndUpdate(
      { paciente: req.params.id },
      { notasGenerales, ultimaActualizacion: Date.now() },
      { new: true }
    );

    if (!historia) {
      return res.status(404).json({ error: 'Historia clínica no encontrada' });
    }

    res.status(200).json(historia);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar las notas' });
  }
};
