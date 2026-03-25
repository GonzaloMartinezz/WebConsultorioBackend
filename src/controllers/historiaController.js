const HistoriaClinica = require('../models/HistoriaClinica');

// 1. Buscar la historia de un paciente (o crearla si es nuevo)
exports.obtenerHistoria = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    let historia = await HistoriaClinica.findOne({ paciente: idPaciente });
    
    // Si el paciente es nuevo y no tiene ficha, le creamos una en blanco automáticamente
    if (!historia) {
      historia = await HistoriaClinica.create({ paciente: idPaciente, odontograma: [] });
    }
    
    res.status(200).json(historia);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la historia clínica' });
  }
};

// 2. Agregar o actualizar el estado de un diente
exports.actualizarDiente = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { diente, diagnostico } = req.body;

    let historia = await HistoriaClinica.findOne({ paciente: idPaciente });

    // Verificamos si ese diente ya tenía algo anotado antes
    const indexDiente = historia.odontograma.findIndex(d => d.diente === diente);

    if (indexDiente >= 0) {
      // Si ya existía, lo actualizamos (ej: pasó de Caries a Curado)
      historia.odontograma[indexDiente].diagnostico = diagnostico;
      historia.odontograma[indexDiente].fecha = Date.now();
    } else {
      // Si es un diente nuevo con problemas, lo agregamos a la lista
      historia.odontograma.push({ diente, diagnostico });
    }

    await historia.save();
    res.status(200).json(historia);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el odontograma' });
  }
};
