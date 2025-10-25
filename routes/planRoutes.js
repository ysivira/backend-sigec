//============================================================================
// ROUTES: PLANES
//=============================================================================
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

// GET /api/plans (Listar todos)
router.get('/', getAllPlansAdmin);

// POST /api/plans (Crear Plan)
router.post(
  '/',
  validatePlanCreation, 
  checkValidation,      
  createPlan            
);

// --- Rutas para un ID específico ---

// GET /api/plans/:id (Ver detalle)
router.get('/:id', getPlanById);

// PUT /api/plans/:id (Actualizar Plan)
router.put(
  '/:id',
  validatePlanUpdate, // APLICA REGLAS
  checkValidation,    // CHEQUEA ERRORES
  updatePlan          // SI PASA, VA AL CONTROLADOR
);

// DELETE /api/plans/:id (Borrado lógico)
router.delete('/:id', deletePlan);

module.exports = router;