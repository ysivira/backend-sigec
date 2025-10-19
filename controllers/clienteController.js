//============================================================================
// CONTROLADOR DE CLIENTE
//============================================================================= 
const Cliente = require('../models/clienteModel');

// @desc    Verificar si un cliente existe por DNI
// @route   GET /api/clientes/verify/:dni
// @access  Private (Asesor)
const verifyClienteByDni = async (req, res) => {
  try {
    const { dni } = req.params;
    const cliente = await Cliente.findByDni(dni);

    if (cliente) {
      // Si existe, devolvemos los datos del cliente
      res.status(200).json(cliente);
    } else {
      // Si no existe, devolvemos un 404
      res.status(404).json({ message: 'Cliente no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Crear un nuevo cliente
// @route   POST /api/clientes
// @access  Private (Asesor)
const createCliente = async (req, res) => {
  try {
    const { dni, nombres, apellidos, email, telefono } = req.body;

    // Validación 
    if (!dni || !nombres || !apellidos || !email || !telefono) {
      return res.status(400).json({ message: 'DNI, Nombres, Apellidos, Email y Teléfono son requeridos.' });
    }

    // Verificamos si el cliente ya existe (para evitar duplicados)
    const clienteExistente = await Cliente.findByDni(dni);
    if (clienteExistente) {
      return res.status(400).json({ message: 'Un cliente con este DNI ya existe.' });
    }

    // El ID del asesor viene del token (req.user fue añadido por el authMiddleware)
    const empleado_id = req.employee.legajo; 

    const dataCliente = {
      dni,
      nombres,
      apellidos,
      email,
      telefono,
      empleado_id, 
    };

    const result = await Cliente.create(dataCliente);

    res.status(201).json({ 
      message: 'Cliente creado exitosamente', 
      clienteId: result.insertId 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

module.exports = {
  verifyClienteByDni,
  createCliente,
};