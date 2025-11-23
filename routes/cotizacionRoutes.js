//============================================================================
// RUTAS DE COTIZACIONES
//============================================================================
/**
 * @file cotizacionRoutes.js
 * @description Rutas para la gestión de cotizaciones.
 * @requires express
 * @requires ../controllers/cotizacionController
 * @requires ../middleware/authMiddleware
 * @requires ../middleware/validationMiddleware
 */

const express = require('express');
const router = express.Router();
const { 
    calculateQuote, 
    verifyDni, 
    createCotizacion,
    getCotizacionById,
    getCotizacionesByAsesor,
    updateCotizacion,
    anularCotizacion,
    getCotizacionPDF
} = require('../controllers/cotizacionController');
const { protect } = require('../middleware/authMiddleware');
const {
    checkValidation,
    validateCotizacion
} = require('../middleware/validationMiddleware');

// Todas las rutas son privadas (requieren autenticación)
router.use(protect); 

/**
 * @swagger
 * /cotizaciones/calculate:
 *   post:
 *     tags: [Cotizaciones]
 *     summary: Pre-calcula una cotización para mostrar en el resumen (sin guardar).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CotizacionPayload'
 *     responses:
 *       200:
 *         description: Cálculo exitoso.
 *       400:
 *         description: Datos inválidos.
 */
router.post('/calculate', 
    calculateQuote
);

/**
 * @swagger
 * /cotizaciones/verify-dni/{dni}:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Verifica si un DNI ya tiene una cotización.
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: DNI verificado.
 *       409:
 *         description: El cliente ya se encuentra cotizado por otro asesor.
 */
router.get('/verify-dni/:dni', verifyDni);

/**
 * @swagger
 * /cotizaciones:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Obtiene todas las cotizaciones del asesor autenticado.
 *     responses:
 *       200:
 *         description: Lista de cotizaciones.
 */
router.get('/asesor', getCotizacionesByAsesor);   

/**
 * @swagger
 * /cotizaciones:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Ruta raíz alternativa para obtener cotizaciones..
 *     responses:
 *       200:
 *         description: Lista de cotizaciones.
 */
router.get('/', getCotizacionesByAsesor);   


/**
 * @swagger
 * /cotizaciones:
 *   post:
 *     tags: [Cotizaciones]
 *     summary: Crea una nueva cotización.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CotizacionPayload'
 *     responses:
 *       201:
 *         description: Cotización creada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       409:
 *         description: Ya existe una cotización activa para este cliente, plan y cantidad de miembros.
 */
router.post('/', 
    validateCotizacion,
    checkValidation,
    createCotizacion
);

/**
 * @swagger
 * /cotizaciones/{id}/pdf:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Genera y descarga el PDF de una cotización.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF de la cotización.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: No tiene permisos para ver esta cotización.
 *       404:
 *         description: Cotización no encontrada.
 */
router.get('/:id/pdf', getCotizacionPDF);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   put:
 *     tags: [Cotizaciones]
 *     summary: Anula una cotización.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cotización anulada exitosamente.
 *       400:
 *         description: Error al anular la cotización.
 *       403:
 *         description: No autorizado para anular esta cotización.
 *       404:
 *         description: Cotización no encontrada.
 */
router.put('/anular/:id', anularCotizacion);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   put:
 *     tags: [Cotizaciones]
 *     summary: Actualiza una cotización.
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
 *             $ref: '#/components/schemas/CotizacionPayload'
 *     responses:
 *       200:
 *         description: Cotización actualizada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       403:
 *         description: No autorizado para modificar esta cotización.
 *       404:
 *         description: Cotización no encontrada.
 */
router.put('/:id',
    validateCotizacion,
    checkValidation,
    updateCotizacion
);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   get:
 *     tags: [Cotizaciones]
 *     summary: Obtiene una cotización completa por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cotización completa.
 *       403:
 *         description: No tiene permisos para ver esta cotización.
 *       404:
 *         description: Cotización no encontrada.
 */
router.get('/:id', getCotizacionById);


module.exports = router;