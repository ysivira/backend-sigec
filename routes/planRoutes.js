//============================================================================
// ROUTES: PLANES
//=============================================================================

const express = require('express');
const router = express.Router();
const {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// MIDLEWARE: Proteger todas las rutas y permitir solo a administradores
router.use(protect, isAdmin);

router.route('/')
  .post(createPlan)
  .get(getAllPlans);

router.route('/:id')
  .get(getPlanById)
  .put(updatePlan)
  .delete(deletePlan);

module.exports = router;