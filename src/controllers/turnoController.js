const Turno = require('../models/Turno');
const Paciente = require('../models/Paciente');
const nodemailer = require('nodemailer');

// Helper para enviar correo de confirmación con link de Google Calendar
const enviarEmailConfirmacion = async (turno) => {
  if (!turno.email) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'tu-correo-clinica@gmail.com',
      pass: process.env.EMAIL_PASS || 'tu-contraseña-de-aplicacion'
    }
  });

  // 📝 Procesar Horas para Google Calendar
  let startTime = '090000';
  let endTime = '100000';
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])/;
  const match = turno.hora ? turno.hora.match(timeRegex) : null;

  if (match) {
    const h = match[1].padStart(2, '0');
    const m = match[2].padStart(2, '0');
    startTime = `${h}${m}00`;
    let endH = parseInt(h) + 1;
    if (endH > 23) endH = 23;
    endTime = `${String(endH).padStart(2, '0')}${m}00`;
  } else if (turno.hora?.includes('Mañana')) {
    startTime = '090000';
    endTime = '130000';
  } else if (turno.hora?.includes('Tarde')) {
    startTime = '160000';
    endTime = '200000';
  }

  const horaLegibleFin = `${(parseInt(startTime.substring(0, 2)) + 1).toString().padStart(2, '0')}:${startTime.substring(2, 4)}`;
  const fechaLimpia = turno.fecha ? turno.fecha.replace(/-/g, '') : '';

  // Título solicitado: TURNO CENTRO ODONTOLOGICO C&M - MOTIVO
  const tituloGCal = `TURNO CENTRO ODONTOLOGICO C&M - ${(turno.motivo || 'CONSULTA').toUpperCase()}`;

  const gcalLink = fechaLimpia
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(tituloGCal)}&dates=${fechaLimpia}T${startTime}/${fechaLimpia}T${endTime}&details=${encodeURIComponent('👨‍⚕️ Profesional: ' + turno.profesional + '\n🦷 Motivo: ' + (turno.motivo || 'Consulta General') + '\n📍 Ubicación: Rondeau 827, Tucumán\n\n⚠️ CONFIGURA LA NOTIFICACIÓN 1 DÍA ANTES AL AGENDAR.')}&location=${encodeURIComponent('C&M Centro Odontológico')}`
    : '';

  const fechaLegible = turno.fecha ? turno.fecha.split('-').reverse().join('/') : '';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); background-color: #ffffff;">
      <div style="background-color: #1e293b; color: white; padding: 40px 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #f97316;">C&M Centro Odontológico</h2>
        <h1 style="margin: 10px 0 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Turno Confirmado</h1>
      </div>
      
      <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
        <p style="font-size: 18px; margin-top: 0;">Hola <strong>${turno.nombrePaciente}</strong>,</p>
        <p style="font-size: 16px; color: #475569;">Tu cita ha sido agendada correctamente. A continuación, te detallamos la información de tu turno:</p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="${gcalLink}" style="background-color: #f97316; color: white; padding: 18px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);">
                📅 AGENDAR EN GOOGLE CALENDAR
            </a>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 12px; font-weight: bold;">(Recordá configurar la notificación 1 día antes al guardar)</p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; border-radius: 20px; border: 1px solid #f1f5f9; margin-top: 40px;">
            <p style="margin: 0 0 15px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;"><strong>📅 FECHA:</strong> ${fechaLegible}</p>
            <p style="margin: 0 0 15px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;"><strong>⏰ HORARIO:</strong> ${turno.hora} hs (Finaliza aprox ${horaLegibleFin} hs)</p>
            <p style="margin: 0 0 15px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;"><strong>👨‍⚕️ PROFESIONAL:</strong> ${turno.profesional}</p>
            <p style="margin: 0; font-size: 14px;"><strong>🦷 MOTIVO:</strong> ${turno.motivo || 'Consulta General'}</p>
        </div>

        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px;">
            <p style="color: #64748b; font-size: 12px;">
                Si necesitás cancelar o reprogramar, por favor avisanos vía WhatsApp.<br>
                <strong>Jose Rondeau 827, San Miguel de Tucumán</strong>
            </p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: `"Centro Odontológico" <${process.env.EMAIL_USER || 'noreply@clinica.com'}>`,
      to: turno.email,
      subject: '✔️ ¡Turno Confirmado! - Centro Odontológico',
      html: htmlContent
    };
    await transporter.sendMail(mailOptions);
    console.log("Email de confirmación enviado con éxito a:", turno.email);
  } catch (error) {
    console.error("Error al enviar email (recuerda configurar EMAIL_USER y EMAIL_PASS en tu .env):", error.message);
  }
};

// Helper para enviar correo de NPS (Encuesta de Satisfacción)
async function enviarEmailNPS(turno) {
  if (!turno.email) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'tu-correo-clinica@gmail.com',
      pass: process.env.EMAIL_PASS || 'tu-contraseña-de-aplicacion'
    }
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; text-transform: uppercase;">¿Qué te pareció tu atención?</h2>
      </div>
      <div style="padding: 20px; color: #333; text-align: center;">
        <p>Hola <strong>${turno.nombrePaciente}</strong>,</p>
        <p>Gracias por confiar en <strong>C&M Dental</strong> para tu cuidado bucal.</p>
        <p>Tu opinión es muy importante para nosotros. ¿Del 1 al 5, qué tan satisfecho estás con tu atención de hoy?</p>
        
        <div style="margin: 30px 0; display: flex; justify-content: center; gap: 10px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/encuesta?v=1&t=${turno._id}" style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: #fee2e2; color: #991b1b; text-decoration: none; font-weight: bold; border: 1px solid #fecaca;">1</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/encuesta?v=2&t=${turno._id}" style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: #ffedd5; color: #9a3412; text-decoration: none; font-weight: bold; border: 1px solid #fed7aa;">2</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/encuesta?v=3&t=${turno._id}" style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: #fef9c3; color: #854d0e; text-decoration: none; font-weight: bold; border: 1px solid #fef08a;">3</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/encuesta?v=4&t=${turno._id}" style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: #dcfce7; color: #166534; text-decoration: none; font-weight: bold; border: 1px solid #bbf7d0;">4</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/encuesta?v=5&t=${turno._id}" style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: #d1fae5; color: #065f46; text-decoration: none; font-weight: bold; border: 1px solid #a7f3d0;">5</a>
        </div>
        
        <p style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
            ¡Muchas gracias por ayudarnos a mejorar!<br>Equipo C&M Dental.
        </p>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: `"C&M Dental - Satisfacción" <${process.env.EMAIL_USER || 'noreply@clinica.com'}>`,
      to: turno.email,
      subject: '⭐ ¿Cómo estuvo tu visita hoy?',
      html: htmlContent
    };
    await transporter.sendMail(mailOptions);
    console.log("Email NPS enviado con éxito a:", turno.email);
  } catch (error) {
    console.error("Error al enviar email NPS:", error.message);
  }
}

// @desc    Crear un nuevo turno solicitado por un paciente
// @route   POST /api/turnos
// @access  Público (Cualquiera puede pedir un turno desde la web)
exports.crearTurno = async (req, res) => {
  try {
    const { nombrePaciente, apellidoPaciente, dni, email, telefono, profesional, fecha, hora, motivo } = req.body;

    // 1. Buscamos si el paciente ya existe (PRIORIDAD: DNI, luego Email, luego Teléfono)
    let paciente = null;
    
    if (dni) {
      paciente = await Paciente.findOne({ dni });
    } else if (email) {
      paciente = await Paciente.findOne({ email });
    } else if (telefono) {
      paciente = await Paciente.findOne({ telefono });
    }

    // 2. Si no existe, lo creamos automáticamente para que aparezca en el Directorio/Historia Clínica
    if (!paciente) {
      paciente = new Paciente({
        nombre: nombrePaciente,
        apellido: apellidoPaciente,
        dni: dni || null, // null permite que 'sparse: true' ignore la unicidad si no hay valor
        email: email || null,
        telefono: telefono || null
      });
      await paciente.save();
      console.log(`✅ Nuevo paciente registrado automáticamente desde turno: ${nombrePaciente} ${apellidoPaciente}`);
    }

    // 3. Creamos el turno, enlazándolo con el ID del paciente (si existe)
    const nuevoTurno = new Turno({
      pacienteId: paciente ? paciente._id : undefined,
      nombrePaciente,
      apellidoPaciente,
      dni,
      email,
      telefono,
      profesional,
      fecha,
      hora,
      motivo,
      estado: 'Pendiente'
    });

    const turnoGuardado = await nuevoTurno.save();

    res.status(201).json({
      mensaje: 'Turno solicitado con éxito. Aguarde confirmación.',
      turno: turnoGuardado
    });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(400).json({ error: 'Error al solicitar el turno', detalle: error.message });
  }
};

// @desc    Obtener todos los turnos (Para llenar la tabla del AdminDashboard)
// @route   GET /api/turnos
// @access  Privado (Solo Admin)
exports.obtenerTurnos = async (req, res) => {
  try {
    // Busca todos los turnos, popula datos del paciente, y los ordena por fecha y hora
    const turnos = await Turno.find()
      .populate('pacienteId', 'nombre apellido dni telefono email estado')
      .sort({ fecha: 1, hora: 1 });
    res.status(200).json(turnos);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    res.status(500).json({ error: 'Hubo un error al obtener los turnos' });
  }
};

// @desc    Actualizar el estado de un turno (Aceptar o Rechazar)
// @route   PATCH /api/turnos/:id/estado
// @access  Privado (Solo Admin)
exports.actualizarEstadoTurno = async (req, res) => {
  try {
    const { 
      estado, 
      fecha, 
      hora, 
      profesional, 
      notasConsulta,
      nombrePaciente,
      apellidoPaciente,
      dni,
      email,
      telefono
    } = req.body; // Recibirá 'Confirmado', 'Cancelado', etc. y opcional fecha/hora/notas
    const turnoId = req.params.id;

    // Validar que el estado sea permitido
    if (estado && !['Pendiente', 'Confirmado', 'Cancelado', 'Atendido', 'Completado', 'Finalizado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const camposAActualizar = {};
    if (estado) camposAActualizar.estado = estado;
    if (fecha) camposAActualizar.fecha = fecha;
    if (hora) camposAActualizar.hora = hora;
    if (profesional) camposAActualizar.profesional = profesional;
    if (notasConsulta !== undefined) camposAActualizar.notasConsulta = notasConsulta;
    
    // 📝 Permitir actualizar datos del paciente desde el Turno
    if (nombrePaciente) camposAActualizar.nombrePaciente = nombrePaciente;
    if (apellidoPaciente) camposAActualizar.apellidoPaciente = apellidoPaciente;
    if (dni !== undefined) camposAActualizar.dni = dni;
    if (email !== undefined) camposAActualizar.email = email;
    if (telefono !== undefined) camposAActualizar.telefono = telefono;

    const turnoActualizado = await Turno.findByIdAndUpdate(
      turnoId,
      camposAActualizar,
      { new: true } // Para que devuelva el turno ya modificado
    );

    if (!turnoActualizado) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Automáticamente enviar el email cuando se confirma en la Agenda
    if (estado === 'Confirmado') {
      // 📝 Sincronización proactiva: Si el turno no tiene pacienteId o el paciente no existe, intentamos crearlo/vincularlo ahora
      // 📝 Sincronización proactiva: Buscar o crear el expediente clínico
      let paciente = null;
      
      // Intentamos localizar al paciente por varias vías
      if (turnoActualizado.pacienteId) {
        paciente = await Paciente.findById(turnoActualizado.pacienteId);
      }
      
      if (!paciente && turnoActualizado.dni) {
        paciente = await Paciente.findOne({ dni: turnoActualizado.dni });
      }
      
      if (!paciente && turnoActualizado.email) {
        paciente = await Paciente.findOne({ email: turnoActualizado.email });
      }

      if (!paciente) {
        // CREAR NUEVO
        paciente = new Paciente({
          nombre: turnoActualizado.nombrePaciente,
          apellido: turnoActualizado.apellidoPaciente,
          dni: turnoActualizado.dni || null,
          email: turnoActualizado.email || null,
          telefono: turnoActualizado.telefono || null
        });
        await paciente.save();
        console.log(`✅ Nuevo expediente clínico creado: ${turnoActualizado.nombrePaciente}`);
      } else {
        // ACTUALIZAR EXISTENTE (Sincronizar datos por si cambiaron en el turno)
        paciente.nombre = turnoActualizado.nombrePaciente || paciente.nombre;
        paciente.apellido = turnoActualizado.apellidoPaciente || paciente.apellido;
        if (turnoActualizado.dni) paciente.dni = turnoActualizado.dni;
        if (turnoActualizado.email) paciente.email = turnoActualizado.email;
        if (turnoActualizado.telefono) paciente.telefono = turnoActualizado.telefono;
        await paciente.save();
      }
      
      // Asegurar que el turno esté vinculado al ID del paciente
      if (!turnoActualizado.pacienteId || turnoActualizado.pacienteId.toString() !== paciente._id.toString()) {
        turnoActualizado.pacienteId = paciente._id;
        await turnoActualizado.save();
      }

      await enviarEmailConfirmacion(turnoActualizado);
    }

    // Enviar encuesta NPS cuando el turno finaliza
    if (estado === 'Finalizado') {
      await enviarEmailNPS(turnoActualizado);
    }

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

// @desc    Eliminar un turno (Borrado lógico para conservar estadísticas)
// @route   DELETE /api/turnos/:id
// @access  Privado (Solo Admin)
exports.eliminarTurno = async (req, res) => {
  try {
    const turnoId = req.params.id;
    
    // En lugar de borrar, marcamos como Cancelado para que se sume a las estadísticas
    // de volumen, motivos y carga por profesional, tal como solicitó el usuario.
    const turnoEliminado = await Turno.findByIdAndUpdate(
      turnoId, 
      { estado: 'Cancelado' },
      { new: true }
    );

    if (!turnoEliminado) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.status(200).json({ mensaje: 'Turno marcado como cancelado/eliminado para fines estadísticos' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la eliminación', detalle: error.message });
  }
};
