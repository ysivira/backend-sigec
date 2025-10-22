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

    const dataCliente = {
      dni,
      nombres,
      apellidos,
      email,
      telefono,
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

// @desc    Obtener listado de clientes por asesor logueado
// @route   GET /api/clientes/asesor
// @access  Private (Asesor)
const getClientesByAsesor = async (req, res) => {
  try {
    const asesor_logueado_legajo = req.employee.legajo;
    const clientes = await Cliente.findClientesByAsesor(asesor_logueado_legajo);
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al obtener listado de clientes:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// @desc    Actualizar datos de un cliente
// @route   PUT /api/clientes/:id
// @access  Private (Asesor)
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;
    
    // Verifica que el cliente existe
    const cliente = await Cliente.findById(id); 
    
    if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    
    // Verifica que pertenece al asesor
    if (cliente.asesor_captador_id !== asesor_logueado_legajo) {
      return res.status(403).json({ message: 'No autorizado para modificar este cliente.' });
    }

    // Si todo está bien, actualizarlo
    const dataToUpdate = req.body;
    const result = await Cliente.update(id, dataToUpdate);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Cliente actualizado exitosamente.' });
    } else {
      res.status(400).json({ message: 'No se pudo actualizar el cliente.' });
    }

  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};




module.exports = {
  verifyClienteByDni,
  createCliente,
  getClientesByAsesor,
  updateCliente
};