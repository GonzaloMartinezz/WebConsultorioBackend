const cron = require('node-cron');
const nodemailer = require('nodemailer');
const moment = require('moment');
const Turno = require('../models/Turno');

// Configuración del transportador (Usa variables de entorno existentes)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const inicializarCronJobs = () => {
    console.log("Servicio de tareas programadas (Cron Jobs) inicializado.");

    // Tarea de Recordatorios: Se ejecuta todos los días a las 08:00 AM
    // '0 8 * * *' -> Minuto 0, Hora 8, Cualquier día del mes, Cualquier mes, Cualquier día de la semana
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log("Ejecutando tarea programada: Recordatorios de turnos para mañana...");
            
            // Calculamos la fecha de mañana en el formato que está guardado en el modelo (YYYY-MM-DD)
            const manana = moment().add(1, 'days').format('YYYY-MM-DD');
            
            // Buscamos turnos confirmados para mañana que tengan email
            const turnosManana = await Turno.find({ 
                fecha: manana, 
                estado: 'Confirmado',
                email: { $exists: true, $ne: "" }
            });

            console.log(`Se encontraron ${turnosManana.length} turnos para mañana.`);

            for (let turno of turnosManana) {
                const mailOptions = {
                    from: `"C&M Dental - Recordatorio" <${process.env.EMAIL_USER}>`,
                    to: turno.email,
                    subject: '⏰ Recordatorio de Turno - C&M Dental',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                            <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
                                <h2 style="margin: 0;">Recordatorio de Consulta</h2>
                            </div>
                            <div style="padding: 20px; color: #333;">
                                <p>Hola <strong>${turno.nombrePaciente}</strong>,</p>
                                <p>Te recordamos que tenés un turno agendado para mañana:</p>
                                <ul style="list-style: none; padding: 0; background-color: #f1f5f9; padding: 15px; border-radius: 8px;">
                                    <li><strong>📅 Fecha:</strong> ${moment(turno.fecha).format('DD/MM/YYYY')}</li>
                                    <li><strong>⏰ Hora:</strong> ${turno.hora}</li>
                                    <li><strong>🦷 Motivo:</strong> ${turno.motivo}</li>
                                    <li><strong>👨‍⚕️ Profesional:</strong> ${turno.profesional}</li>
                                </ul>
                                <p>¡Te esperamos!</p>
                                <p style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
                                    Si no podés asistir, por favor avisanos con anticipación.<br>
                                    Este es un mensaje automático, por favor no respondas a este correo.
                                </p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Recordatorio enviado a: ${turno.email}`);
            }
            
            if (turnosManana.length > 0) {
                console.log(`Total de recordatorios enviados hoy: ${turnosManana.length}`);
            }
        } catch (error) {
            console.error("Error en el cron job de recordatorios:", error);
        }
    });

    // Podríamos añadir más cron jobs aquí en el futuro
};

module.exports = { inicializarCronJobs };
