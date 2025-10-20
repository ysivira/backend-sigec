//============================================================================
// RUTAS DE COTIZACIONES
//============================================================================
const express = require('express');
const router = express.Router();
const { verifyDni } = require('../controllers/cotizacionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Todas las rutas son privadas (requieren autenticación)

//Ruta para verificar DNI
router.get('/verify-dni/:dni', verifyDni);


module.exports = router;