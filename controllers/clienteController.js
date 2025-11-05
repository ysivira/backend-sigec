//============================================================================
// CONTROLADOR DE CLIENTE
//============================================================================= 

/**
 * @file clienteController.js
 * @description Controlador para gestionar las operaciones relacionadas con los clientes.
 * @requires ../models/clienteModel
 * @requires express-async-handler
 */
const Cliente = require('../models/clienteModel');
const asyncHandler = require('express-async-handler');

/**
 * @description Verifica si un cliente existe por su DNI.
 * @route GET /api/clientes/verify/:dni
 * @access Private (Asesor)
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @throws {Error} Si el cliente no se encuentra.
 */
const verifyClienteByDni = asyncHandler(async (req, res) => {
  const { dni } = req.params;
  const cliente = await Cliente.findByDni(dni);

  if (cliente) {
    res.status(200).json(cliente);
  } else {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }
});

/**
 * @description Crea un nuevo cliente en la base de datos.
 * @route POST /api/clientes
 * @access Private (Asesor)
 * @param {object} req - Objeto de solicitud de Express con los datos del cliente en el body.
 * @param {object} res - Objeto de respuesta de Express.
 * @throws {Error} Si ya existe un cliente con el mismo DNI.
 */
const createCliente = asyncHandler(async (req, res) => {
  const { dni, nombres, apellidos, email, telefono, direccion } = req.body;

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
    direccion,
    asesor_captador_id: req.employee.legajo
  };

  const result = await Cliente.create(dataCliente);

  res.status(201).json({
    message: 'Cliente creado exitosamente',
    clienteId: result.insertId
  });
});

/**
 * @description Obtiene el listado de clientes asociados al asesor que ha iniciado sesión.
 * @route GET /api/clientes/asesor
 * @access Private (Asesor)
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
const getClientesByAsesor = asyncHandler(async (req, res) => {
  const asesor_logueado_legajo = req.employee.legajo;
  const clientes = await Cliente.findClientesByAsesor(asesor_logueado_legajo);
  res.status(200).json(clientes);
});

/**
 * @description Actualiza los datos de un cliente existente.
 * @route PUT /api/clientes/:id
 * @access Private (Asesor)
 * @param {object} req - Objeto de solicitud de Express con el ID del cliente y los datos a actualizar.
 * @param {object} res - Objeto de respuesta de Express.
 * @throws {Error} Si el cliente no se encuentra o el asesor no tiene permisos.
 */
const updateCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const asesor_logueado_legajo = req.employee.legajo;

  const cliente = await Cliente.findById(id);

  if (!cliente) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Verifica que el cliente pertenece al asesor que intenta modificarlo
  if (cliente.asesor_captador_id !== asesor_logueado_legajo) {
    res.status(403);
    throw new Error('No autorizado para modificar este cliente.');
  }

  // El middleware 'validateClientUpdate' ya ha validado el body
  const dataToUpdate = req.body;
  const result = await Cliente.update(id, dataToUpdate);

  if (result.affectedRows > 0) {
    res.status(200).json({ message: 'Cliente actualizado exitosamente.' });
  } else {
    res.status(404).json({ message: 'No se pudo actualizar el cliente.' });
  }
});

module.exports = {
  verifyClienteByDni,
  createCliente,
  getClientesByAsesor,
  updateCliente
};
