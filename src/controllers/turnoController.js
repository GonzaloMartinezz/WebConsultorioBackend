const Turno = require('../models/Turno');
const nodemailer = require('nodemailer');

// Helper para enviar correo de confirmación con link de Google Calendar
const enviarEmailConfirmacion = async (turno) => {
  if (!turno.email) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'tu-correo-clinica@gmail.com', // CONFIGURAR EN EL .ENV
      pass: process.env.EMAIL_PASS || 'tu-contraseña-de-aplicacion'  // CONFIGURAR EN EL .ENV
    }
  });

  // Integración Google Calendar
  let startTime = '090000';
  let endTime = '130000';
  if (turno.hora && turno.hora.includes('Tarde')) {
      startTime = '160000';
      endTime = '200000';
  }
  const fechaLimpia = turno.fecha ? turno.fecha.replace(/-/g, '') : '';
  const gcalLink = fechaLimpia 
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Turno Odontológico: ' + turno.profesional)}&dates=${fechaLimpia}T${startTime}/${fechaLimpia}T${endTime}&details=${encodeURIComponent('Consulta por: ' + turno.motivo)}`
      : '';
      
  const fechaLegible = turno.fecha ? turno.fecha.split('-').reverse().join('/') : '';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="background-color: #d97706; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; text-transform: uppercase;">¡Tu turno ha sido confirmado!</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Hola <strong>${turno.nombrePaciente}</strong>,</p>
        <p>Nos complace confirmarte que tu turno con <strong>${turno.profesional}</strong> ha sido agendado exitosamente en nuestra clínica.</p>
        
        <ul style="list-style: none; padding: 0; background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #d97706;">
            <li style="margin-bottom: 5px;"><strong>📅 Fecha:</strong> ${fechaLegible}</li>
            <li style="margin-bottom: 5px;"><strong>⏰ Horario:</strong> ${turno.hora}</li>
            <li><strong>🦷 Motivo:</strong> ${turno.motivo}</li>
        </ul>

        <p style="margin-top: 20px;">Para mayor comodidad técnica, podes agendar el turno de manera rápida en tu Google Calendar tocando este botón:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${gcalLink}" style="background-color: #1a73e8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; border: 2px solid #174ea6;">
                📆 Agregar evento a Google Calendar
            </a>
        </div>
        
        <p style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
            Si necesitas reprogramar o cancelar, por favor contáctate con nosotros respondiendo los chats directos de WhatsApp.<br><br>¡Te esperamos!
        </p>
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
    console.error("Error al obtener turnos:", error);
    res.status(500).json({ error: 'Hubo un error al obtener los turnos' });
  }
};

// @desc    Actualizar el estado de un turno (Aceptar o Rechazar)
// @route   PATCH /api/turnos/:id/estado
// @access  Privado (Solo Admin)
exports.actualizarEstadoTurno = async (req, res) => {
  try {
    const { estado, fecha, hora } = req.body; // Recibirá 'Confirmado', 'Cancelado', etc. y opcional fecha/hora editados
    const turnoId = req.params.id;

    // Validar que el estado sea permitido
    if (!['Pendiente', 'Confirmado', 'Cancelado', 'Atendido'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const camposAActualizar = { estado };
    if (fecha) camposAActualizar.fecha = fecha;
    if (hora) camposAActualizar.hora = hora;

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
      await enviarEmailConfirmacion(turnoActualizado);
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
