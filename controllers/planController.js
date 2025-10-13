//============================================================================
// CONTROLLER: PLANES
//=============================================================================

const Plan = require('../models/planModel');

// @desc    Crear un nuevo plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del plan es requerido.' });
    }
    const result = await Plan.create({ nombre });
    res.status(201).json({ message: 'Plan creado exitosamente', planId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Obtener todos los planes
// @route   GET /api/plans
// @access  Private/Admin
const getAllPlans = async (req, res) => {
  try {
    const planes = await Plan.getAll();
    res.status(200).json(planes);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
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
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del plan es requerido.' });
    }
    await Plan.update(req.params.id, { nombre });
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
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};