const Turno = require('../models/Turno');
const Usuario = require('../models/Usuario');
const Paciente = require('../models/Paciente');

exports.obtenerEstadisticas = async (req, res) => {
  try {
    // 1. Contar pacientes totales
    const totalUsuarios = await Usuario.countDocuments({ rol: { $ne: 'admin' } });
    let totalPacientesRegistro = 0;
    try {
      totalPacientesRegistro = await Paciente.countDocuments();
    } catch (e) {}
    const totalPacientes = Math.max(totalUsuarios, totalPacientesRegistro);

    // 2. Traer TODOS los turnos
    const todosTurnos = await Turno.find();

    // 3. Estado de turnos
    const turnosPendientes  = todosTurnos.filter(t => t.estado === 'Pendiente').length;
    const turnosConfirmados = todosTurnos.filter(t => t.estado === 'Confirmado').length;
    const turnosCancelados  = todosTurnos.filter(t => t.estado === 'Cancelado').length;
    const turnosAtendidos   = todosTurnos.filter(t => ['Atendido', 'Completado', 'Finalizado'].includes(t.estado)).length;

    // 4. Carga por profesional — dinámico: usa los valores REALES que están en la BD
    const cargaProfesionalesRaw = {};
    todosTurnos.forEach(t => {
      const prof = (t.profesional || 'Sin asignar').trim();
      cargaProfesionalesRaw[prof] = (cargaProfesionalesRaw[prof] || 0) + 1;
    });

    // 5. Motivos — categorías expandidas + captura de motivos únicos no clasificados
    const motivos = {
      general:       0,
      limpieza:      0,
      ortodoncia:    0,
      implantologia: 0,
      endodoncia:    0,
      cirugia:       0,
      urgencia:      0,
      estetica:      0,
      blanqueamiento: 0,
      protesis:      0,
      periodoncia:   0,
      radiografia:   0,
      otros:         0,
    };

    // Mapa de motivos no clasificados (para enviar al frontend como listado real)
    const motivosNoClasificados = {};

    todosTurnos.forEach(t => {
      const m = (t.motivo || '').toLowerCase().trim();

      if (m.includes('ortodoncia') || m.includes('bracket') || m.includes('aparato')) {
        motivos.ortodoncia++;
      } else if (m.includes('limpieza') || m.includes('profilaxis') || m.includes('detartraje')) {
        motivos.limpieza++;
      } else if (m.includes('blanquea') || m.includes('aclaramiento')) {
        motivos.blanqueamiento++;
      } else if (m.includes('dolor') || m.includes('urgencia') || m.includes('emergencia')) {
        motivos.urgencia++;
      } else if (m.includes('implant') || m.includes('implante')) {
        motivos.implantologia++;
      } else if (m.includes('endodoncia') || m.includes('conducto') || m.includes('nervio')) {
        motivos.endodoncia++;
      } else if (m.includes('cirug') || m.includes('extracci') || m.includes('muela') || m.includes('cordal')) {
        motivos.cirugia++;
      } else if (m.includes('estetic') || m.includes('carilla') || m.includes('veneer') || m.includes('estetica')) {
        motivos.estetica++;
      } else if (m.includes('protesis') || m.includes('prótesis') || m.includes('corona') || m.includes('puente') || m.includes('postizo')) {
        motivos.protesis++;
      } else if (m.includes('perio') || m.includes('encia') || m.includes('encías') || m.includes('gingivitis')) {
        motivos.periodoncia++;
      } else if (m.includes('radio') || m.includes('placa') || m.includes('panoramic') || m.includes('radiograf')) {
        motivos.radiografia++;
      } else if (m.includes('general') || m.includes('control') || m.includes('consulta') || m.includes('revisión') || m.includes('revision') || m.includes('chequeo')) {
        motivos.general++;
      } else {
        motivos.otros++;
        // Capturar texto real para análisis
        const motivoOriginal = (t.motivo || 'Sin motivo').trim();
        motivosNoClasificados[motivoOriginal] = (motivosNoClasificados[motivoOriginal] || 0) + 1;
      }
    });

    // 6. Turnos por mes (robusto)
    const turnosPorMes = {};
    todosTurnos.forEach(t => {
      if (t.fecha) {
        let mesKey = "";
        if (t.fecha.includes('-')) {
          const partes = t.fecha.split('-');
          if (partes[0].length === 4) mesKey = `${partes[0]}-${partes[1]}`;
          else mesKey = `${partes[2]}-${partes[1]}`;
        } else if (t.fecha.includes('/')) {
          const partes = t.fecha.split('/');
          if (partes[2]?.length === 4) mesKey = `${partes[2]}-${partes[1].padStart(2,'0')}`;
        }
        if (mesKey) {
          turnosPorMes[mesKey] = (turnosPorMes[mesKey] || 0) + 1;
        }
      }
    });

    const listaUsuarios = await Usuario.find({ rol: { $ne: 'admin' } }, 'nombre apellido email telefono createdAt').sort({ nombre: 1, apellido: 1 });
    
    const turnosConfList = todosTurnos.filter(t => t.estado === 'Confirmado').map(t => ({
      _id: t._id, nombrePaciente: t.nombrePaciente, apellidoPaciente: t.apellidoPaciente, fecha: t.fecha, hora: t.hora, motivo: t.motivo, profesional: t.profesional
    }));
    const turnosCancList = todosTurnos.filter(t => t.estado === 'Cancelado').map(t => ({
      _id: t._id, nombrePaciente: t.nombrePaciente, apellidoPaciente: t.apellidoPaciente, fecha: t.fecha, hora: t.hora, motivo: t.motivo, profesional: t.profesional
    }));

    res.status(200).json({
      pacientesTotales: totalPacientes,
      turnosTotales: todosTurnos.length,
      turnosPendientes,
      turnosConfirmados,
      turnosCancelados,
      turnosAtendidos,
      cargaProfesionales: cargaProfesionalesRaw,   // <-- dinámico, valores reales del campo profesional
      motivosConsulta: motivos,
      motivosDetalle: motivosNoClasificados,         // <-- motivos literales no clasificados
      turnosPorMes,
      listaUsuarios,
      listaTurnosConfirmados: turnosConfList,
      listaTurnosCancelados: turnosCancList
    });
  } catch (error) {
    console.error("Error al calcular estadísticas:", error);
    res.status(500).json({ error: "Error al calcular estadísticas" });
  }
};
