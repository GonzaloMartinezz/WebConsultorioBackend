const Turno = require('../models/Turno');

// Enviar recordatorios para los turnos de mañana
exports.enviarRecordatoriosMañana = async (req, res) => {
  try {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const mañanaStr = mañana.toISOString().split('T')[0];

    // Buscamos turnos de mañana (pendientes o confirmados)
    const turnos = await Turno.find({
      fecha: mañanaStr,
      estado: { $in: ['Pendiente', 'Confirmado'] }
    });

    if (turnos.length === 0) {
      return res.status(200).json({ message: 'No hay turnos para mañana.' });
    }

    // Aquí iría la lógica de envío real (Twilio, Sendgrid, etc.)
    // Por ahora simulamos el proceso
    console.log(`Enviando ${turnos.length} recordatorios para el día ${mañanaStr}`);

    res.status(200).json({ 
      message: `¡Éxito! Se han procesado ${turnos.length} recordatorios para el día de mañana.`,
      cantidad: turnos.length 
    });
  } catch (error) {
    console.error("Error en recordatorios masivos:", error);
    res.status(500).json({ error: 'Error al procesar recordatorios masivos' });
  }
};
