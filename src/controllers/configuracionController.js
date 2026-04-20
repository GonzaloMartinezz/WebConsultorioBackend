const Configuracion = require('../models/Configuracion');

// Obtener configuración (solo hay un documento)
exports.obtenerConfiguracion = async (req, res) => {
  try {
    let config = await Configuracion.findOne();
    if (!config) {
      // Crear configuración inicial si no existe
      config = await Configuracion.create({
        horarios: { apertura: '08:00', cierre: '20:00', intervalo: '30' },
        servicios: [
          { nombre: 'Consulta General', duracion: 30 },
          { nombre: 'Limpieza Dental', duracion: 45 }
        ]
      });
    }
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

// Actualizar configuración
exports.actualizarConfiguracion = async (req, res) => {
  try {
    const { horarios, servicios } = req.body;
    let config = await Configuracion.findOne();
    
    if (config) {
      config.horarios = horarios || config.horarios;
      config.servicios = servicios || config.servicios;
      await config.save();
    } else {
      config = await Configuracion.create({ horarios, servicios });
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};
