//============================================================================
// ROUTES DE LISTA DE PRECIOS
//=============================================================================
/**
 * @file priceListRoutes.js
 * @description Rutas para la gestión de listas de precios.
 * @requires express
 * @requires ../controllers/priceListController
 * @requires ../middleware/authMiddleware
 * @requires ../middleware/adminMiddleware
 * @requires ../middleware/validationMiddleware
 */

const express = require('express');
const router = express.Router();
const {
  createPriceListBulk,
  getPricesByPlan,
  getPricesByType,
  updatePriceEntry,
  deletePriceEntry,
  applyMassiveIncrease,
} = require('../controllers/priceListController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const {
  checkValidation,
  validatePriceUpdate,
  validatePriceIncrease
} = require('../middleware/validationMiddleware');

//=============================================================================
// --- Rutas de Administrador (Crear, Actualizar, Borrar) ---
//=============================================================================

/**
 * @swagger
 * /pricelists:
 *   post:
 *     tags: [Listas de Precios]
 *     summary: Crea múltiples entradas de precio (Carga Masiva).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/PriceListEntry'
 *           example:
 *             - lista_nombre: "Obligatorio"
 *               plan_id: 1
 *               edad_desde: 0
 *               edad_hasta: 17
 *               tipo_ingreso: "monotributo"
 *               precio: 15000
 *             - lista_nombre: "Obligatorio"
 *               plan_id: 1
 *               edad_desde: 18
 *               edad_hasta: 25
 *               tipo_ingreso: "monotributo"
 *               precio: 20000
 *     responses:
 *       201:
 *         description: Listas de precios cargadas exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: No es administrador.
 */
router.route('/')
  .post(protect, isAdmin, createPriceListBulk);

/**
 * @swagger
 * /pricelists/{id}:
 *   put:
 *     tags: [Listas de Precios]
 *     summary: Actualiza una entrada de precio.
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/PriceListEntry'
 *     responses:
 *       200:
 *         description: Entrada de precio actualizada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: No es administrador.
 *   delete:
 *     tags: [Listas de Precios]
 *     summary: Elimina (lógicamente) una entrada de precio.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrada de precio eliminada exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: No es administrador.
 */
router.route('/:id')
  .put(
    protect, 
    isAdmin, 
    validatePriceUpdate, 
    checkValidation, 
    updatePriceEntry
  )
  .delete(protect, isAdmin, deletePriceEntry);

/**
 * @swagger
 * /pricelists/increase:
 *   post:
 *     tags: [Listas de Precios]
 *     summary: Aplica un aumento masivo a los precios.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               porcentaje:
 *                 type: number
 *               tipo_ingreso:
 *                 type: string
 *                 enum: [Obligatorio, Voluntario, Ambas]
 *     responses:
 *       200:
 *         description: Aumento aplicado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: No es administrador.
 */
router.post('/increase', 
  protect, 
  isAdmin,
  validatePriceIncrease,
  checkValidation,
  applyMassiveIncrease
);

//=============================================================================
// --- Rutas de Lectura (Admin y Asesor) ---
//=============================================================================

/**
 * @swagger
 * /pricelists/plan/{planId}/{tipoIngreso}:
 *   get:
 *     tags: [Listas de Precios]
 *     summary: Obtiene los precios por Plan y Tipo de Ingreso.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tipoIngreso
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Obligatorio, Voluntario]
 *     responses:
 *       200:
 *         description: Lista de precios.
 *       401:
 *         description: No autorizado.
 */
router.get('/plan/:planId/:tipoLista', protect, getPricesByPlan);

/**
 * @swagger
 * /pricelists/type/{tipoIngreso}:
 *   get:
 *     tags: [Listas de Precios]
 *     summary: Obtiene todos los precios de un tipo de lista.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoIngreso
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Obligatorio, Voluntario]
 *     responses:
 *       200:
 *         description: Lista de precios.
 *       400:
 *         description: El tipo de lista debe ser 'Obligatorio' o 'Voluntario'.
 *       401:
 *         description: No autorizado.
 */
router.get('/type/:tipoLista', protect, getPricesByType);

module.exports = router;