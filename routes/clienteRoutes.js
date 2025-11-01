//============================================================================
// RUTAS DE CLIENTE
//============================================================================= 
/**
 * @file clienteRoutes.js
 * @description Rutas para la gestión de clientes.
 * @requires express
 * @requires ../controllers/clienteController
 * @requires ../middleware/authMiddleware
 * @requires ../middleware/validationMiddleware
 */

const express = require('express');
const router = express.Router();
const {
  verifyClienteByDni,
  createCliente,
  getClientesByAsesor,
  updateCliente
} = require('../controllers/clienteController');

const { protect } = require('../middleware/authMiddleware');

// Importamos las reglas de validaciones y el revisor
const {
  validateClientCreation,
  validateClientUpdate,
  checkValidation
} = require('../middleware/validationMiddleware');

// Todas las rutas están protegidas, solo accesibles por asesores autenticados
router.use(protect);

/**
 * @swagger
 * /clientes/verify/{dni}:
 *   get:
 *     tags: [Clientes]
 *     summary: Verifica si un cliente existe por DNI.
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado.
 *       404:
 *         description: Cliente no encontrado.
 */
router.get('/verify/:dni', verifyClienteByDni);

/**
 * @swagger
 * /clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Crea un nuevo cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       409:
 *         description: El cliente ya existe.
 */
router.post('/',
  validateClientCreation, 
  checkValidation,      
  createCliente
);

/**
 * @swagger
 * /clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Obtiene los clientes del asesor autenticado.
 *     responses:
 *       200:
 *         description: Lista de clientes.
 */
router.get('/', getClientesByAsesor);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Actualiza un cliente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       403:
 *         description: No autorizado para modificar este cliente.
 *       404:
 *         description: Cliente no encontrado.
 */
router.put('/:id',
  validateClientUpdate,
  checkValidation,
  updateCliente
);

module.exports = router;