//============================================================================
// CONTROLLER: PLANES
//=============================================================================

const Plan = require('../models/planModel');

// @desc    Crear un nuevo plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const { nombre, detalles, condiciones_generales } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del plan es requerido.' });
    }

    const planId = await Plan.create({ 
      nombre, 
      detalles, 
      condiciones_generales, 
    });
    res.status(201).json({ 
      message: 'Plan creado exitosamente', 
      planId: planId
    });
  } catch (error) {
    console.error('Error al crear el plan:', error);
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Obtener todos los planes (activos e inactivos)
// @route   GET /api/plans
// @access  Private/Admin
const getAllPlansAdmin = async (req, res) => {
  try {
    const planes = await Plan.getAllAdmin();
    res.status(200).json(planes);
  } catch (error) {
    console.error('Error al obtener planes (Admin):', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// @desc    Obtener un plan por ID
// @route   GET /api/plans/:id
// @access  Private/Admin
const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.getById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado.' });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Actualizar un plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  try {
    
    const { nombre, detalles, condiciones_generales, activo } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del plan es requerido.' });
    }

    const estadoActivo = (activo === true || activo === 1) ? 1 : 0;

    await Plan.update(req.params.id, { 
      nombre, 
      detalles, 
      condiciones_generales, 
      activo: estadoActivo 
    });
    
    res.status(200).json({ message: 'Plan actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Eliminar (lógicamente) un plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
  try {
    await Plan.remove(req.params.id);
    res.status(200).json({ message: 'Plan eliminado (inactivado) exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

module.exports = {
  createPlan,
  getAllPlansAdmin,
  getPlanById,
  updatePlan,
  deletePlan,

};