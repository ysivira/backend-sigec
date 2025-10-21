//============================================================================
// RUTAS DE COTIZACIONES
//============================================================================
const express = require('express');
const router = express.Router();
const { verifyDni, createCotizacion } = require('../controllers/cotizacionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Todas las rutas son privadas (requieren autenticación)

//Ruta para verificar DNI
router.get('/verify-dni/:dni', verifyDni);

// Ruta para crear la cotización (y el cliente si es nuevo)
router.post('/', createCotizacion);


module.exports = router;