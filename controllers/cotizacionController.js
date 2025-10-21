//============================================================================
// CONTROLADOR DE COTIZACIONES
//============================================================================
const Cotizacion = require('../models/cotizacionModel');
const Cliente = require('../models/clienteModel');

// @desc    Verificar un cliente por DNI 
// @route   GET /api/cotizaciones/verify-dni/:dni
// @access  Private (Asesor)

const verifyDni = async (req, res) => {
  try {
    let { dni } = req.params;

    dni = dni.replace(':', ''); 
    const asesor_logueado_legajo = req.employee.legajo;

    const clienteExistente = await Cliente.findByDni(dni);

    if (!clienteExistente) {
      return res.status(200).json({
        existe: false,
        message: 'Cliente no encontrado. Puede proceder a crear una nueva cotización.'
      });
    }

    const baseResponse = {
      cliente: {
        id: clienteExistente.id, 
        dni: clienteExistente.dni,
        nombres: clienteExistente.nombres,
        apellidos: clienteExistente.apellidos,
        direccion: clienteExistente.direccion,
        codigo_postal: clienteExistente.codigo_postal,
        ciudad: clienteExistente.ciudad,
        provincia: clienteExistente.provincia,
        telefono: clienteExistente.telefono,
      },
    };

    const ultimaCotizacion = await Cotizacion.findLastCotizationByDni(dni);

    if (!ultimaCotizacion) {
      return res.status(200).json({
        existe: true,
        cotizado_por_mi: true,
        message: 'Cliente encontrado. Puede crear una nueva cotización.',
        ...baseResponse,
        ultima_cotizacion: null
      });
    }

    const asesorCotizadorLegajo = ultimaCotizacion.asesor_legajo;

    if (asesorCotizadorLegajo === asesor_logueado_legajo) {
      return res.status(200).json({
        existe: true,
        cotizado_por_mi: true,
        message: 'Cliente ya cotizado por usted. Puede modificar la última cotización o crear una nueva.',
        ...baseResponse,
        ultima_cotizacion: {
          id: ultimaCotizacion.cotizacion_id,
          plan: ultimaCotizacion.plan_nombre,
          fecha_registro: ultimaCotizacion.fecha_creacion,
        }
      });
    } else {
      const fechaFormateada = ultimaCotizacion.fecha_creacion ? new Date(ultimaCotizacion.fecha_creacion).toLocaleDateString('es-AR') : 'Fecha no disponible';
      return res.status(409).json({
        existe: true,
        cotizado_por_mi: false,
        message: `El cliente ya se encuentra cotizado por el asesor ${ultimaCotizacion.asesor_nombre} ${ultimaCotizacion.asesor_apellido} en fecha ${fechaFormateada}.`,
        ...baseResponse,
        asesor_cotizador: {
          nombre: ultimaCotizacion.asesor_nombre,
          apellido: ultimaCotizacion.asesor_apellido,
        },
        fecha_cotizacion: ultimaCotizacion.fecha_creacion,
      });
    }
  } catch (error) {
    console.error('Error en verifyDni:', error);
    res.status(500).json({ message: 'Error del servidor al verificar el DNI', error });
  }
};

// @desc    Crear una nueva cotización (Y cliente si es necesario)
// @route   POST /api/cotizaciones
// @access  Private (Asesor)
const createCotizacion = async (req, res) => {
  try {
    // El body debe venir con esta estructura
    const { clienteData, cotizacionData, miembrosData } = req.body;
    const asesor_id = req.employee.legajo; // Asesor logueado

    let cliente_id;

    if (!clienteData || !cotizacionData || !miembrosData) {
      return res.status(400).json({ message: 'Faltan datos de cliente, cotización o miembros.' });
    }

    // --- LÓGICA DE CLIENTE ---
    const clienteExistente = await Cliente.findByDni(clienteData.dni);

    if (clienteExistente) {
      cliente_id = clienteExistente.id; 
    } else {
      // Cliente es nuevo, lo creamos 
      const nuevoClienteData = {
        ...clienteData,
        asesor_captador_id: asesor_id 
      };
      const resultCliente = await Cliente.create(nuevoClienteData);
      cliente_id = resultCliente.insertId; 
    }

    // --- LÓGICA DE COTIZACIÓN ---
    const fullCotizacionData = {
      ...cotizacionData,
      cliente_id: cliente_id, 
      asesor_id: asesor_id
    };

    // Llamamos al modelo 
    const result = await Cotizacion.createFullCotizacion(fullCotizacionData, miembrosData);

    res.status(201).json(result); // { id: cotizacionId, message: '...' }

  } catch (error) {
    console.error('Error al crear la cotización:', error);
    res.status(500).json({ message: 'Error en el servidor al crear la cotización', error: error.message });
  }
};

module.exports = {
  verifyDni,
  createCotizacion,
};