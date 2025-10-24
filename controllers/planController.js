//============================================================================
// CONTROLLER: PLANES
//=============================================================================
const asyncHandler = require('express-async-handler');
const Plan = require('../models/planModel');

// @desc    Crear un nuevo plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = asyncHandler(async (req, res) => {
  const { nombre, detalles, condiciones_generales } = req.body;
  if (!nombre) {
    res.status(400);
    throw new Error('El nombre del plan es requerido.');
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
});

// @desc    Obtener todos los planes (activos e inactivos)
// @route   GET /api/plans
// @access  Private/Admin
const getAllPlansAdmin = asyncHandler(async (req, res) => {
  const planes = await Plan.getAllAdmin();
  res.status(200).json(planes);
});

// @desc    Obtener un plan por ID
// @route   GET /api/plans/:id
// @access  Private/Admin
const getPlanById = asyncHandler(async (req, res) => {
  const plan = await Plan.getById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error('Plan no encontrado.');
  }
  res.status(200).json(plan);
});

// @desc    Actualizar un plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = asyncHandler(async (req, res) => {
  const { nombre, detalles, condiciones_generales, activo } = req.body;

  if (!nombre) {
    res.status(400);
    throw new Error('El nombre del plan es requerido.');
  };

  const estadoActivo = (activo === true || activo === 1) ? 1 : 0;

  await Plan.update(req.params.id, {
    nombre,
    detalles,
    condiciones_generales,
    activo: estadoActivo
  });

  res.status(200).json({ message: 'Plan actualizado exitosamente.' });
});

// @desc    Eliminar (lógicamente) un plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = asyncHandler(async (req, res) => {
  await Plan.remove(req.params.id);
  res.status(200).json({ message: 'Plan eliminado (inactivado) exitosamente.' });
});

module.exports = {
  createPlan,
  getAllPlansAdmin,
  getPlanById,
  updatePlan,
  deletePlan,

};