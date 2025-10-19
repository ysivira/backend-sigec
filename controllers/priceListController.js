//============================================================================
// CONTROLADOR DE LISTA DE PRECIOS
//=============================================================================

const PriceList = require('../models/priceListModel');
const Plan = require('../models/planModel');

// @desc    Crear una nueva entrada de precio
// @route   POST /api/pricelists
// @access  Private/Admin
const createPriceEntry = async (req, res) => {
  // ===========================================
  try {
    const { plan_id, tipo_lista, edad_min, edad_max, precio } = req.body;

    // Validaciones
    if (plan_id === undefined || !tipo_lista || edad_min === undefined || edad_max === undefined || precio === undefined) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    if (tipo_lista !== 'Obligatoria' && tipo_lista !== 'Voluntaria') {
      return res.status(400).json({ message: "El tipo de lista debe ser 'Obligatoria' o 'Voluntaria'." });
    }

    // Verificar que el plan existe (y está activo)
    const plan = await Plan.getById(plan_id);
    if (!plan) {
      return res.status(404).json({ message: 'El plan asociado no existe o está inactivo.' });
    }

    const result = await PriceList.create({ plan_id, tipo_lista, edad_min, edad_max, precio });
    res.status(201).json({ message: 'Entrada de precio creada exitosamente', priceListId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Obtener todas las entradas de precio de un plan y tipo
// @route   GET /api/pricelists/plan/:planId/:tipoLista
// @access  Private (Admin y Asesor)
const getPricesByPlan = async (req, res) => {
  try {
    const { planId, tipoLista } = req.params;
    const prices = await PriceList.getByPlanId(planId, tipoLista);
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Obtener TODAS las entradas de un tipo de lista (Obligatoria o Voluntaria)
// @route   GET /api/pricelists/type/:tipoLista
// @access  Private (Admin y Asesor)
const getPricesByType = async (req, res) => {
  try {
    const { tipoLista } = req.params;
    if (tipoLista !== 'Obligatoria' && tipoLista !== 'Voluntaria') {
      return res.status(400).json({ message: "El tipo de lista debe ser 'Obligatoria' o 'Voluntaria'." });
    }
    const prices = await PriceList.getByType(tipoLista);
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Actualizar una entrada de precio
// @route   PUT /api/pricelists/:id
// @access  Private/Admin
const updatePriceEntry = async (req, res) => {
  try {
    const { edad_min, edad_max, precio } = req.body;
    if (edad_min === undefined || edad_max === undefined || precio === undefined) {
      return res.status(400).json({ message: 'Debe ingresar los campos: edad_min, edad_max y precio.' });
    }

    await PriceList.update(req.params.id, { edad_min, edad_max, precio });
    res.status(200).json({ message: 'Entrada de precio actualizada exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Eliminar (lógicamente) una entrada de precio
// @route   DELETE /api/pricelists/:id
// @access  Private/Admin
const deletePriceEntry = async (req, res) => {
  try {
    await PriceList.remove(req.params.id);
    res.status(200).json({ message: 'Entrada de precio eliminada exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// @desc    Aplicar un aumento masivo a los precios
// @route   POST /api/priceList/increase 
// @access  Private/Admin
const applyMassiveIncrease = async (req, res) => {
  try {
    const { porcentaje, tipo_lista } = req.body;

    // Validación
    if (!porcentaje || !tipo_lista) {
      return res.status(400).json({ message: 'Debe ingresar el "porcentaje" de aumento y un "tipo de lista".' });
    }
    if (tipo_lista !== 'Obligatoria' && tipo_lista !== 'Voluntaria' && tipo_lista !== 'Ambas') {
      return res.status(400).json({ message: "El tipo de lista debe ser 'Obligatoria', 'Voluntaria' o 'Ambas'." });
    }

    const result = await PriceList.applyMassiveIncrease(parseFloat(porcentaje), tipo_lista);

    res.status(200).json({
      message: 'Aumento aplicado exitosamente.',
      registros_afectados: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

module.exports = {
  createPriceEntry,
  getPricesByPlan,
  getPricesByType,
  updatePriceEntry,
  deletePriceEntry,
  applyMassiveIncrease,
};
