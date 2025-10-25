//============================================================================
// RUTAS DE COTIZACIONES
//============================================================================
const express = require('express');
const router = express.Router();
const { 
    verifyDni, 
    createCotizacion,
    getCotizacionById,
    getCotizacionesByAsesor,
    updateCotizacion,
    anularCotizacion
} = require('../controllers/cotizacionController');
const { protect } = require('../middleware/authMiddleware');
const {
  checkValidation,
  validateCotizacion
} = require('../middleware/validationMiddleware');

// Todas las rutas son privadas (requieren autenticación)
router.use(protect); 

//Ruta para verificar DNI
router.get('/verify-dni/:dni', verifyDni);

//Ruta para obtener todas las cotizaciones del asesor logueado
router.get('/', getCotizacionesByAsesor);   

// Ruta para crear la cotización (y el cliente si es nuevo)
router.post('/', 
    validateCotizacion,
    checkValidation,
    createCotizacion
);

// Ruta para anular una cotización
router.delete('/:id', anularCotizacion);

// Ruta para actualizar una cotización
router.put('/:id',
    validateCotizacion,
    checkValidation,
    updateCotizacion
);

// Ruta para obtener cotización completa por ID
router.get('/:id', getCotizacionById);


module.exports = router;