//============================================================================
// CONTROLADOR DE LISTA DE PRECIOS 
//=============================================================================

const PriceList = require('../models/priceListModel');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Crear múltiples entradas de precio (Carga Masiva)
 * @route   POST /api/pricelists
 */
const createPriceListBulk = asyncHandler(async (req, res) => {
  const entries = req.body;

  
  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400);
    throw new Error('El body debe ser un array no vacío de listas de precios.');
  }
 
  const result = await PriceList.createBulk(entries);

  res.status(201).json({
    message: 'Listas de precios cargadas exitosamente.',
    registros_afectados: result.affectedRows
  });
});

/**
 * @desc    Obtener precios por Plan y Tipo
 * @route   GET /api/pricelists/plan/:planId/:tipoLista
 */
const getPricesByPlan = asyncHandler(async (req, res) => {
  
  const { planId, tipoLista } = req.params; 
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (!planId || !tipoLista) {
      res.status(400);
      throw new Error('Faltan parámetros (planId o tipoLista).');
  }

  const prices = await PriceList.getByPlanId(planId, tipoLista);
  res.status(200).json(prices);
});

/**
 * @desc    Obtener precios por Tipo
 * @route   GET /api/pricelists/type/:tipoLista
 */
const getPricesByType = asyncHandler(async (req, res) => {
  
  const { tipoLista } = req.params;

  if (tipoLista !== 'Obligatorio' && tipoLista !== 'Voluntario' && tipoLista !== 'Monotributo') {
    res.status(400);
    throw new Error('Tipo de lista inválido.');
  }

  const prices = await PriceList.getByType(tipoLista);
  res.status(200).json(prices);
});

/**
 * @desc    Actualizar precio individual
 * @route   PUT /api/pricelists/:id
 */
const updatePriceEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const dataToUpdate = req.body;

  if (Object.keys(dataToUpdate).length === 0) {
    res.status(400);
    throw new Error('No hay datos para actualizar.');
  }

  const result = await PriceList.update(id, dataToUpdate);

  if (result.affectedRows === 0) {
     res.status(404);
     throw new Error('No se encontró el precio.');
  }

  res.status(200).json({ message: 'Precio actualizado.' });
});

/**
 * @desc    Eliminar precio
 * @route   DELETE /api/pricelists/:id
 */
const deletePriceEntry = asyncHandler(async (req, res) => {
  await PriceList.remove(req.params.id);
  res.status(200).json({ message: 'Precio eliminado.' });
});

/**
 * @desc    Aumento Masivo
 * @route   POST /api/pricelists/increase
 */
const applyMassiveIncrease = asyncHandler(async (req, res) => {
 
  const { porcentaje, tipo_ingreso, tipo_lista, tipoLista } = req.body;
  const tipoFinal = tipo_ingreso || tipo_lista || tipoLista;

  if (!porcentaje || !tipoFinal) {
      res.status(400);
      throw new Error('Faltan datos para el aumento.');
  }

  const result = await PriceList.applyMassiveIncrease(parseFloat(porcentaje), tipoFinal);

  res.status(200).json({
    message: 'Aumento aplicado.',
    registros_afectados: result.affectedRows
  });
});

module.exports = {
  createPriceListBulk,
  getPricesByPlan,
  getPricesByType,
  updatePriceEntry,
  deletePriceEntry,
  applyMassiveIncrease,
};