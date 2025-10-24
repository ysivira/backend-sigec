//============================================================================
// RUTAS DE CLIENTE
//============================================================================= 
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

// @route   GET /api/clientes/verify/:dni
// Ruta para verificar si un cliente existe
router.get('/verify/:dni', verifyClienteByDni);

// @route   POST /api/clientes
// Ruta para crear un nuevo cliente
router.post('/',
  validateClientCreation, 
  checkValidation,      
  createCliente
);

// @route   GET /api/clientes
// Ruta para obtener clientes del asesor autenticado
router.get('/', getClientesByAsesor);

// @route   PUT /api/clientes/:id
// Ruta para actualizar un cliente
router.put('/:id',
  validateClientUpdate,
  checkValidation,
  updateCliente
);

module.exports = router;