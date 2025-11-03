//============================================================================
// CONTROLADOR DE LISTA DE PRECIOS
//=============================================================================
/**
 * @file priceListController.js
 * @description Controlador para la gestión de listas de precios.
 * @requires ../models/priceListModel
 * @requires ../models/planModel
 * @requires express-async-handler
 */

const PriceList = require('../models/priceListModel');
const Plan = require('../models/planModel');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Crear múltiples entradas de precio (Carga Masiva)
 * @route   POST /api/pricelists
 * @access  Private/Admin
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const createPriceListBulk = asyncHandler(async (req, res) => {
  const entries = req.body;

  // Verificamos que sea un array y que no esté vacío
  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400);
    throw new Error('El body debe ser un array no vacío de listas de precios.');
  }

  const entriesProcesadas = entries.map(entry => {

    const rango_etario_string = `${entry.edad_desde}-${entry.edad_hasta}`;

    return {
      ...entry,
      rango_etario: rango_etario_string
    };
  });

  const result = await PriceList.createBulk(entriesProcesadas);

  res.status(201).json({
    message: 'Listas de precios cargadas exitosamente.',
    registros_afectados: result.affectedRows
  });
});

/**
 * @desc    Obtener todas las entradas de precio de un plan y tipo
 * @route   GET /api/pricelists/plan/:planId/:tipoLista
 * @access  Private (Admin y Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const getPricesByPlan = asyncHandler(async (req, res) => {

  const { planId, tipoIngreso } = req.params;
  const prices = await PriceList.getByPlanId(planId, tipoIngreso);
  res.status(200).json(prices);

});

/**
 * @desc    Obtener TODAS las entradas de un tipo de lista (Obligatoria o Voluntaria)
 * @route   GET /api/pricelists/type/:tipoLista
 * @access  Private (Admin y Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const getPricesByType = asyncHandler(async (req, res) => {

  const { tipoIngreso } = req.params;

  if (tipoIngreso !== 'Obligatorio' && tipoIngreso !== 'Voluntario') {
    res.status(400);
    throw new Error('El tipo de lista debe ser "Obligatorio" o "Voluntario".');
  }

  const prices = await PriceList.getByType(tipoIngreso);
  res.status(200).json(prices);
});

/**
 * @desc    Actualizar una entrada de precio
 * @route   PUT /api/pricelists/:id
 * @access  Private/Admin
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const updatePriceEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { precio, edad_desde, edad_hasta } = req.body;

  const dataToUpdate = {};

  if (precio !== undefined) {
    dataToUpdate.precio = precio;
  }

  if (edad_desde !== undefined && edad_hasta !== undefined) {
    dataToUpdate.rango_etario = `${edad_desde}-${edad_hasta}`;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    res.status(400);
    throw new Error('No se enviaron campos válidos para actualizar (ej: precio, edad_desde, edad_hasta).');
  }

  const result = await PriceList.update(id, dataToUpdate);

  if (result.affectedRows === 0) {
     res.status(404);
     throw new Error('No se encontró una entrada de precio con ese ID.');
  }

  res.status(200).json({ message: 'Entrada de precio actualizada exitosamente.' });
});

/**
 * @desc    Eliminar (lógicamente) una entrada de precio
 * @route   DELETE /api/pricelists/:id
 * @access  Private/Admin
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const deletePriceEntry = asyncHandler(async (req, res) => {
  await PriceList.remove(req.params.id);
  res.status(200).json({ message: 'Entrada de precio eliminada exitosamente.' });
});

/**
 * @desc    Aplicar un aumento masivo a los precios
 * @route   POST /api/priceList/increase 
 * @access  Private/Admin
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const applyMassiveIncrease = asyncHandler(async (req, res) => {
  const { porcentaje, tipo_ingreso } = req.body;

  const result = await PriceList.applyMassiveIncrease(parseFloat(porcentaje), tipo_ingreso);

  res.status(200).json({
    message: 'Aumento aplicado exitosamente.',
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