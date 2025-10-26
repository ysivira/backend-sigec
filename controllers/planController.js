//============================================================================
// CONTROLLER: PLANES
//=============================================================================

const asyncHandler = require('express-async-handler');
const Plan = require('../models/planModel');
const PlanModel = require('../models/planModel');

// @desc    Crear un nuevo plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = asyncHandler(async (req, res) => {
  const { nombre, detalles, condiciones_generales } = req.body;

  // (Validación simple de campos)
  if (!nombre) {
    res.status(400);
    throw new Error('El campo "nombre" es obligatorio.');
  }

  const planId = await PlanModel.create({
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
  const planes = await PlanModel.getAllAdmin();
  res.status(200).json(planes);
});

// @desc    Obtener un plan por ID (Activo o Inactivo)
// @route   GET /api/plans/:id
// @access  Private/Admin
const getPlanById = asyncHandler(async (req, res) => {
  
  const plan = await PlanModel.getById(req.params.id); 
  if (!plan) {
    res.status(404);
    throw new Error('Plan no encontrado o inactivo.');
  }
  res.status(200).json(plan);
});

// @desc    Actualizar un plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, detalles, condiciones_generales, activo } = req.body;

  // 1. Verificar que el plan existe
  const planExistente = await PlanModel.getById(id);
  if (!planExistente && activo !== 1) { // Si no lo encuentra (quizás está inactivo)
      const planAdmin = await PlanModel.getAllAdmin(); 
      if (!planAdmin.find(p => p.id == id)) {
        res.status(404);
        throw new Error('Plan no encontrado.');
      }
  }

  // 2. Construir el objeto de actualización
  // (Filtramos campos undefined para que el PUT actualice solo lo que se envía)
  const updateData = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (detalles !== undefined) updateData.detalles = detalles;
  if (condiciones_generales !== undefined) updateData.condiciones_generales = condiciones_generales;
  if (activo !== undefined) {
    updateData.activo = (activo === true || activo === 1) ? 1 : 0;
  }

  // 3. Validar que algo se envió
  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error('No se enviaron datos para actualizar.');
  }

  // 4. Ejecutar la actualización
  const result = await PlanModel.update(id, updateData);

  if (result.affectedRows === 0) {
    res.status(400);
    throw new Error('No se pudo actualizar el plan.');
  }

  res.status(200).json({ message: 'Plan actualizado exitosamente.' });
});

// @desc    Eliminar (lógicamente) un plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = asyncHandler(async (req, res) => {
  const result = await PlanModel.remove(req.params.id);
  
  if (result.affectedRows === 0) {
    res.status(404);
    throw new Error('Plan no encontrado.');
  }
  res.status(200).json({ message: 'Plan eliminado (inactivado) exitosamente.' });
});

// @desc    Obtener todos los planes (SOLO ACTIVOS)
// @route   GET /api/plans/active
// @access  Private (Asesor)
const getActivePlans = asyncHandler(async (req, res) => {
    const planes = await PlanModel.getAll();
    res.status(200).json(planes);
});


module.exports = {
  createPlan,
  getAllPlansAdmin,
  getPlanById,
  updatePlan,
  deletePlan,
  getActivePlans // ¡Importante! Añadimos esta ruta para los Asesores
};