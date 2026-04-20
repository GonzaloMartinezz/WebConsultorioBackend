const FichaClinica = require('../models/FichaClinica');

// GET /api/fichas/:id -> Obtener la ficha del paciente
exports.obtenerFicha = async (req, res) => {
  try {
    const { id } = req.params;
    let ficha = await FichaClinica.findOne({ pacienteId: id });
    
    // Si el paciente es nuevo y no tiene ficha, le devolvemos una estructura vacía
    if (!ficha) {
      return res.status(200).json({ odontograma: [], historialConsultas: [] });
    }
    
    res.status(200).json(ficha);
  } catch (error) {
    console.error("Error al obtener ficha:", error);
    res.status(500).json({ error: "Error al obtener la ficha médica" });
  }
};

// PUT /api/fichas/:id -> Guardar odontograma y/o nueva consulta
exports.actualizarFicha = async (req, res) => {
  try {
    const { id } = req.params;
    const { odontograma, nuevaConsulta } = req.body;

    // Preparamos lo que vamos a actualizar (siempre el odontograma)
    let updateQuery = { $set: { odontograma: odontograma || [] } };
    
    // Si el frontend envió una nueva consulta con motivo, la agregamos al historial
    if (nuevaConsulta && nuevaConsulta.motivo) {
      updateQuery.$push = { historialConsultas: nuevaConsulta };
    }

    // Buscamos y actualizamos. Si no existe, la crea (upsert: true)
    const fichaActualizada = await FichaClinica.findOneAndUpdate(
      { pacienteId: id },
      updateQuery,
      { new: true, upsert: true }
    );

    res.status(200).json(fichaActualizada);
  } catch (error) {
    console.error("Error al actualizar ficha:", error);
    res.status(500).json({ error: "Error al guardar la ficha médica" });
  }
};

// DELETE /api/fichas/:id/historial/:consultaId -> Eliminar una consulta del historial
exports.eliminarConsultaHistorial = async (req, res) => {
  try {
    const { id, consultaId } = req.params;
    const fichaActualizada = await FichaClinica.findOneAndUpdate(
      { pacienteId: id },
      { $pull: { historialConsultas: { _id: consultaId } } },
      { new: true }
    );
    res.status(200).json(fichaActualizada);
  } catch (error) {
    console.error("Error al eliminar consulta del historial:", error);
    res.status(500).json({ error: "Error al eliminar consulta" });
  }
};

// PUT /api/fichas/:id/historial/:consultaId -> Editar una consulta del historial
exports.editarConsultaHistorial = async (req, res) => {
  try {
    const { id, consultaId } = req.params;
    const { motivo, profesional, tratamientoRealizado, fecha } = req.body;
    
    // Crear el objeto de actualización con los campos enviados
    const unsets = {};
    if (!tratamientoRealizado) unsets['historialConsultas.$.tratamientoRealizado'] = 1;

    const fichaActualizada = await FichaClinica.findOneAndUpdate(
      { pacienteId: id, "historialConsultas._id": consultaId },
      { 
        $set: { 
          "historialConsultas.$.motivo": motivo,
          "historialConsultas.$.profesional": profesional,
          ...(tratamientoRealizado && { "historialConsultas.$.tratamientoRealizado": tratamientoRealizado }),
          ...(fecha && { "historialConsultas.$.fecha": fecha })
        },
        $unset: unsets 
      },
      { new: true }
    );
    res.status(200).json(fichaActualizada);
  } catch (error) {
    console.error("Error al editar consulta del historial:", error);
    res.status(500).json({ error: "Error al editar consulta" });
  }
};
