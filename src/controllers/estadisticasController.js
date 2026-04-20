const Turno = require('../models/Turno');
const Usuario = require('../models/Usuario');
const Paciente = require('../models/Paciente');

exports.obtenerEstadisticas = async (req, res) => {
  try {
    // 1. Contar pacientes totales (que no sean admin) - desde ambas colecciones
    const totalUsuarios = await Usuario.countDocuments({ rol: { $ne: 'admin' } });
    let totalPacientesRegistro = 0;
    try {
      totalPacientesRegistro = await Paciente.countDocuments();
    } catch (e) { /* Si no existe el modelo, continuamos */ }
    const totalPacientes = Math.max(totalUsuarios, totalPacientesRegistro);

    // 2. Traer TODOS los turnos para estadísticas completas
    const todosTurnos = await Turno.find();

    // 3. Estado de turnos
    const turnosPendientes = todosTurnos.filter(t => t.estado === 'Pendiente').length;
    const turnosConfirmados = todosTurnos.filter(t => t.estado === 'Confirmado').length;
    const turnosCancelados = todosTurnos.filter(t => t.estado === 'Cancelado').length;
    const turnosAtendidos = todosTurnos.filter(t => ['Atendido', 'Completado', 'Finalizado'].includes(t.estado)).length;

    // 4. Calcular distribución por profesional (Estandarizado)
    const cargaProfesionales = {
      "Dr. Adolfo Martínez": 0,
      "Dra. Erina Carcara": 0,
      "Otros/Sin asignar": 0
    };

    todosTurnos.forEach(t => {
      const profStr = (t.profesional || '').toLowerCase();
      if (profStr.includes('adolfo') || profStr.includes('martinez') || profStr.includes('martínez')) {
        cargaProfesionales["Dr. Adolfo Martínez"]++;
      } else if (profStr.includes('erina') || profStr.includes('carcara')) {
        cargaProfesionales["Dra. Erina Carcara"]++;
      } else {
        cargaProfesionales["Otros/Sin asignar"]++;
      }
    });

    // 5. Calcular motivos de consulta (más categorías)
    const motivos = { 
      ortodoncia: 0, limpieza: 0, general: 0, urgencia: 0, 
      implantologia: 0, endodoncia: 0, cirugia: 0, estetica: 0, otros: 0 
    };
    todosTurnos.forEach(t => {
      const motivoStr = t.motivo?.toLowerCase() || '';
      if (motivoStr.includes('ortodoncia') || motivoStr.includes('bracket')) motivos.ortodoncia++;
      else if (motivoStr.includes('limpieza')) motivos.limpieza++;
      else if (motivoStr.includes('dolor') || motivoStr.includes('urgencia')) motivos.urgencia++;
      else if (motivoStr.includes('implant')) motivos.implantologia++;
      else if (motivoStr.includes('endodoncia') || motivoStr.includes('conducto')) motivos.endodoncia++;
      else if (motivoStr.includes('cirug') || motivoStr.includes('extracci') || motivoStr.includes('muela')) motivos.cirugia++;
      else if (motivoStr.includes('estetic') || motivoStr.includes('blanquea')) motivos.estetica++;
      else if (motivoStr.includes('general') || motivoStr.includes('control') || motivoStr.includes('consulta')) motivos.general++;
      else motivos.otros++;
    });

    // 6. Turnos por mes (Robustez en el parseo de fecha)
    const turnosPorMes = {};
    todosTurnos.forEach(t => {
      if (t.fecha) {
        // Intentamos detectar YYYY-MM-DD o DD-MM-YYYY
        let mesKey = "";
        if (t.fecha.includes('-')) {
          const partes = t.fecha.split('-');
          if (partes[0].length === 4) mesKey = `${partes[0]}-${partes[1]}`; // YYYY-MM
          else mesKey = `${partes[2]}-${partes[1]}`; // DD-MM-YYYY
        } else if (t.fecha.includes('/')) {
          const partes = t.fecha.split('/');
          if (partes[2].length === 4) mesKey = `${partes[2]}-${partes[1]}`; // DD/MM/YYYY
        }

        if (mesKey) {
          turnosPorMes[mesKey] = (turnosPorMes[mesKey] || 0) + 1;
        }
      }
    });

    res.status(200).json({
      pacientesTotales: totalPacientes,
      turnosTotales: todosTurnos.length,
      turnosPendientes,
      turnosConfirmados,
      turnosCancelados,
      turnosAtendidos,
      cargaProfesionales,
      motivosConsulta: motivos,
      turnosPorMes
    });
  } catch (error) {
    console.error("Error al calcular estadísticas:", error);
    res.status(500).json({ error: "Error al calcular estadísticas" });
  }
};
