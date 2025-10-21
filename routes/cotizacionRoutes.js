//============================================================================
// RUTAS DE COTIZACIONES
//============================================================================
const express = require('express');
const router = express.Router();
const { 
    verifyDni, 
    createCotizacion,
    getCotizacionById,
    getCotizacionesByAsesor
} = require('../controllers/cotizacionController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas son privadas (requieren autenticación)
router.use(protect); 

//Ruta para verificar DNI
router.get('/verify-dni/:dni', verifyDni);

//Ruta para obtener todas las cotizaciones del asesor logueado
router.get('/', getCotizacionesByAsesor);   

// Ruta para crear la cotización (y el cliente si es nuevo)
router.post('/', createCotizacion);

// Ruta para obtener cotización completa por ID
router.get('/:id', getCotizacionById);


module.exports = router;