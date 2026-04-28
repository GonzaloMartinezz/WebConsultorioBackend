const Turno = require('../models/Turno');
const nodemailer = require('nodemailer');

// Configuración de Nodemailer (usa variables de entorno)
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el servicio que utilicen (ej. host: 'smtp.gmail.com')
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Enviar recordatorios para los turnos de mañana
exports.enviarRecordatoriosMañana = async (req, res) => {
  try {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const mañanaStr = mañana.toISOString().split('T')[0];
    const fechaFmt = mañana.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Buscamos turnos de mañana (pendientes o confirmados)
    const turnos = await Turno.find({
      fecha: mañanaStr,
      estado: { $in: ['Pendiente', 'Confirmado'] }
    });

    if (turnos.length === 0) {
      return res.status(200).json({ message: 'No hay turnos para mañana.', enviados: 0 });
    }

    let emailsEnviados = 0;
    const promesasEnvio = turnos.map(async (turno) => {
      // 1. Envío de Email
      if (turno.email) {
        try {
          // Google Calendar Link Generation for Email
          const partes = turno.fecha?.split('-') || [];
          const fechaFmt = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : turno.fecha;
          const textStr = `Turno Dental: ${turno.nombrePaciente}`;
          const startTime = (turno.hora || "00:00").replace(':', '') + '00';
          let endHour = parseInt((turno.hora || "00:00").split(':')[0]) + 1;
          const endTime = String(endHour).padStart(2, '0') + (turno.hora || "00:00").split(':')[1] + '00';
          const datesStr = partes.length === 3 ? `${partes[0]}${partes[1]}${partes[2]}T${startTime}/${partes[0]}${partes[1]}${partes[2]}T${endTime}` : '';
          const detailsStr = `C&M Centro Odontológico\nProfesional: ${turno.profesional}\nProcedimiento: ${turno.motivo}`;
          const locationStr = `Jose Rondeau 827, San Miguel de Tucumán`;
          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(textStr)}&dates=${datesStr}&details=${encodeURIComponent(detailsStr)}&location=${encodeURIComponent(locationStr)}`;

          const mensajeHTML = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
              <!-- Header -->
              <div style="background-color: #1e293b; padding: 40px 20px; text-align: center;">
                <p style="color: #f97316; margin: 0 0 10px 0; font-size: 12px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">C&M Centro Odontológico</p>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">Turno Confirmado</h1>
              </div>
              
              <!-- Body -->
              <div style="padding: 40px 30px;">
                <p style="font-size: 16px; margin: 0 0 15px 0;">Hola <strong>${turno.nombrePaciente}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 35px 0; color: #475569;">Tu cita ha sido agendada correctamente. A continuación, te detallamos la información de tu turno:</p>
                
                <!-- Botón Calendario -->
                <div style="text-align: center; margin-bottom: 40px;">
                  <a href="${calendarUrl}" target="_blank" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    📅 Agendar en Google Calendar
                  </a>
                  <p style="font-size: 11px; color: #94a3b8; margin-top: 12px;">(Recordá configurar la notificación 1 día antes al guardar)</p>
                </div>
                
                <!-- Tarjeta de Detalles -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px;">
                  <div style="padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px;"><strong style="color: #1e293b; display: inline-block; width: 100px;">📅 FECHA:</strong> <span style="color: #475569;">${fechaFmt}</span></p>
                  </div>
                  <div style="padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px;"><strong style="color: #1e293b; display: inline-block; width: 100px;">⏰ HORARIO:</strong> <span style="color: #475569;">${turno.hora} hs <span style="color: #94a3b8; font-size: 12px;">(Finaliza aprox ${String(endHour).padStart(2, '0')}:${turno.hora.split(':')[1]} hs)</span></span></p>
                  </div>
                  <div style="padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px;"><strong style="color: #1e293b; display: inline-block; width: 100px;">👨‍⚕️ PROFESIONAL:</strong> <span style="color: #475569;">${turno.profesional}</span></p>
                  </div>
                  <div style="padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px;"><strong style="color: #1e293b; display: inline-block; width: 100px;">🦷 MOTIVO:</strong> <span style="color: #475569;">${turno.motivo}</span></p>
                  </div>
                  <div>
                    <p style="margin: 0; font-size: 14px;"><strong style="color: #1e293b; display: inline-block; width: 100px;">📍 DIRECCIÓN:</strong> <span style="color: #475569;">Jose Rondeau 827, Tucumán</span></p>
                  </div>
                </div>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"Centro Odontológico C&M" <${process.env.EMAIL_USER}>`,
            to: turno.email,
            subject: 'Recordatorio de Turno - Centro Odontológico C&M',
            html: mensajeHTML
          });
          emailsEnviados++;
        } catch (error) {
          console.error(`Error enviando email a ${turno.email}:`, error);
        }
      }

      // 2. Aquí iría la integración con WhatsApp (Twilio API o WhatsApp Business API)
      // Por ahora la automatización pura de WS sin API oficial no es posible desde backend sin servidor dedicado.
    });

    await Promise.all(promesasEnvio);

    res.status(200).json({ 
      message: `¡Recordatorios procesados! Se enviaron ${emailsEnviados} correos.`,
      cantidadTurnos: turnos.length,
      emailsEnviados
    });
  } catch (error) {
    console.error("Error en recordatorios masivos:", error);
    res.status(500).json({ error: 'Error al procesar recordatorios masivos' });
  }
};
