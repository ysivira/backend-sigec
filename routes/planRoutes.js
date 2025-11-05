//============================================================================
// ROUTES: PLANES
//=============================================================================
/**
 * @file planRoutes.js
 * @description Rutas para la gestión de planes.
 * @requires express
 * @requires ../controllers/planController
 * @requires ../middleware/authMiddleware
 * @requires ../middleware/adminMiddleware
 * @requires ../middleware/validationMiddleware
 */

const express = require('express');
const router = express.Router();
const {
  createPlan,
  getAllPlansAdmin,
  getPlanById,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const {
  checkValidation,
  validatePlanCreation,
  validatePlanUpdate,
} = require('../middleware/validationMiddleware');

// MIDLEWARE: Proteger todas las rutas y permitir solo a administradores
router.use(protect, isAdmin);

/**
 * @swagger
 * /plans:
 *   get:
 *     tags: [Planes]
 *     summary: Obtiene todos los planes (activos e inactivos).
 *     responses:
 *       200:
 *         description: Lista de planes.
 */
router.get('/', getAllPlansAdmin);

/**
 * @swagger
 * /plans:
 *   post:
 *     tags: [Planes]
 *     summary: Crea un nuevo plan.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       201:
 *         description: Plan creado exitosamente.
 *       400:
 *         description: Datos inválidos.
 */
router.post(
  '/',
  validatePlanCreation,
  checkValidation,
  createPlan
);

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     tags: [Planes]
 *     summary: Obtiene un plan por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plan encontrado.
 *       404:
 *         description: Plan no encontrado.
 */
router.get('/:id', getPlanById);

/**
 * @swagger
 * /plans/{id}:
 *   put:
 *     tags: [Planes]
 *     summary: Actualiza un plan (solo Admin).
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
 *             $ref: '#/components/schemas/PlanCreate'
 *     responses:
 *       200:
 *         description: Plan actualizado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       403:
 *         description: No autorizado no es administrador.
 *       404:
 *         description: Plan no encontrado.
 */
router.put(
  '/:id',
  validatePlanUpdate,
  checkValidation,
  updatePlan
);

/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     tags: [Planes]
 *     summary: Elimina (lógicamente) un plan.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plan eliminado exitosamente.
 *       404:
 *         description: Plan no encontrado.
 */
router.delete('/:id', deletePlan);

module.exports = router;