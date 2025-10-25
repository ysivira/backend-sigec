//============================================================================
// ROUTES DE LISTA DE PRECIOS
//=============================================================================

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
// Estas rutas requieren que el usuario sea un administrador
//=============================================================================
router.route('/')
  .post(protect, isAdmin, createPriceListBulk);

router.route('/:id')
  .put(
    protect, 
    isAdmin, 
    validatePriceUpdate, 
    checkValidation, 
    updatePriceEntry
  )
  // Borrado lógico
  .delete(protect, isAdmin, deletePriceEntry);

router.post('/increase', 
  protect, 
  isAdmin,
  validatePriceIncrease,
  checkValidation,
  applyMassiveIncrease
);

//=============================================================================
// --- Rutas de Lectura (Admin y Asesor) ---
// Estas rutas solo requieren que el usuario esté logueado (protect)
// El asesor necesita leer los precios para el cotizador.
//=============================================================================

// Obtener precios por Plan y Tipo (ej: /api/pricelists/plan/1/Obligatoria)
router.get('/plan/:planId/:tipoIngreso', protect, getPricesByPlan);

// Obtener TODOS los precios de un tipo (ej: /api/pricelists/type/Voluntaria)
router.get('/type/:tipoIngreso', protect, getPricesByType);

module.exports = router;