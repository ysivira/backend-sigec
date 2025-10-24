//============================================================================
// CONTROLADOR DE CLIENTE
//============================================================================= 
const Cliente = require('../models/clienteModel');
const asyncHandler = require('express-async-handler');

// @desc    Verificar si un cliente existe por DNI
// @route   GET /api/clientes/verify/:dni
// @access  Private (Asesor)
const verifyClienteByDni = asyncHandler(async (req, res) => {
  const { dni } = req.params;
  const cliente = await Cliente.findByDni(dni);

  if (cliente) {
    // Si existe, devolvemos los datos del cliente
    res.status(200).json(cliente);
  } else {
    // Si no existe, devolvemos un 404
    res.status(404);
    throw new Error('Cliente no encontrado');
  }
});

// @desc    Crear un nuevo cliente
// @route   POST /api/clientes
// @access  Private (Asesor)
const createCliente = asyncHandler(async (req, res) => {
  const { dni, nombres, apellidos, email, telefono } = req.body;

  // Validación 
  if (!dni || !nombres || !apellidos || !email || !telefono) {
    res.status(400);
    throw new Error('DNI, Nombres, Apellidos, Email y Teléfono son requeridos.');
  }

  // Verificamos si el cliente ya existe (para evitar duplicados)
  const clienteExistente = await Cliente.findByDni(dni);
  if (clienteExistente) {
    res.status(409);
    throw new Error('Un cliente con este DNI ya existe.');
  }

  const dataCliente = {
    dni,
    nombres,
    apellidos,
    email,
    telefono,
    asesor_captador_id: req.employee.legajo
  };

  const result = await Cliente.create(dataCliente);

  res.status(201).json({
    message: 'Cliente creado exitosamente',
    clienteId: result.insertId
  });
});

// @desc    Obtener listado de clientes por asesor logueado
// @route   GET /api/clientes/asesor
// @access  Private (Asesor)
const getClientesByAsesor = asyncHandler(async (req, res) => {
  const asesor_logueado_legajo = req.employee.legajo;
  const clientes = await Cliente.findClientesByAsesor(asesor_logueado_legajo);
  res.status(200).json(clientes);

});

// @desc    Actualizar datos de un cliente
// @route   PUT /api/clientes/:id
// @access  Private (Asesor)
const updateCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const asesor_logueado_legajo = req.employee.legajo;

  // Verifica que el cliente existe
  const cliente = await Cliente.findById(id);

  if (!cliente) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Verifica que pertenece al asesor
  if (cliente.asesor_captador_id !== asesor_logueado_legajo) {
    res.status(403);
    throw new Error('No autorizado para modificar este cliente.');
  }

  // Si todo está bien, actualizarlo
  const dataToUpdate = req.body;
  const result = await Cliente.update(id, dataToUpdate);

  if (result.affectedRows > 0) {
    res.status(200).json({ message: 'Cliente actualizado exitosamente.' });
  } else {
    res.status(200).json({ message: 'No se pudo actualizar el cliente.' });
  }
});

module.exports = {
  verifyClienteByDni,
  createCliente,
  getClientesByAsesor,
  updateCliente
};