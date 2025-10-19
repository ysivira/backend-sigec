//============================================================================
// RUTAS DE CLIENTE
//============================================================================= 
const express = require('express');
const router = express.Router();
const {
  verifyClienteByDni,
  createCliente,
} = require('../controllers/clienteController');

const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/clientes/verify/:dni
// Ruta para verificar si un cliente existe
router.get('/verify/:dni', protect, verifyClienteByDni);

// @route   POST /api/clientes
// Ruta para crear un nuevo cliente
router.post('/', protect, createCliente);

module.exports = router;