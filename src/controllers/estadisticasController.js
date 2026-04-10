const Turno = require('../models/Turno');
const Usuario = require('../models/Usuario');

exports.obtenerEstadisticas = async (req, res) => {
  try {
    // 1. Contar pacientes totales (que no sean admin)
    const totalPacientes = await Usuario.countDocuments({ rol: { $ne: 'admin' } });

    // 2. Traer todos los turnos confirmados o pasados
    const turnos = await Turno.find({ estado: { $in: ['Confirmado', 'Atendido'] } });

    // 3. Calcular distribución por profesional
    let turnosAdolfo = 0;
    let turnosErina = 0;
    turnos.forEach(t => {
      if (t.profesional === 'Dr. Adolfo') turnosAdolfo++;
      if (t.profesional === 'Dra. Erina') turnosErina++;
    });

    // 4. Calcular motivos de consulta
    const motivos = { ortodoncia: 0, limpieza: 0, general: 0, urgencia: 0 };
    turnos.forEach(t => {
      const motivoStr = t.motivo?.toLowerCase() || '';
      if (motivoStr.includes('ortodoncia')) motivos.ortodoncia++;
      else if (motivoStr.includes('limpieza')) motivos.limpieza++;
      else if (motivoStr.includes('dolor') || motivoStr.includes('urgencia')) motivos.urgencia++;
      else motivos.general++;
    });

    res.status(200).json({
      pacientesTotales: totalPacientes,
      cargaProfesionales: { Adolfo: turnosAdolfo, Erina: turnosErina, total: turnos.length },
      motivosConsulta: motivos
    });
  } catch (error) {
    res.status(500).json({ error: "Error al calcular estadísticas" });
  }
};
