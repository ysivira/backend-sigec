//============================================================================
// CONTROLADOR DE LISTA DE PRECIOS
//=============================================================================

const PriceList = require('../models/priceListModel');
const Plan = require('../models/planModel');

// @desc    Crear múltiples entradas de precio (Carga Masiva)
// @route   POST /api/pricelists
// @access  Private/Admin
const createPriceListBulk = async (req, res) => {
  try {
    const entries = req.body; 

    // Verificamos que sea un array y que no esté vacío
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ 
        message: 'El body debe ser un array de listas de precios.' 
      });
    }

    // Pasamos el array completo al modelo
    const result = await PriceList.createBulk(entries);

    res.status(201).json({ 
      message: 'Listas de precios cargadas exitosamente.',
      registros_afectados: result.affectedRows 
    });

  } catch (error) {
    console.error('Error en la carga masiva de precios:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// @desc    Obtener todas las entradas de precio de un plan y tipo
// @route   GET /api/pricelists/plan/:planId/:tipoLista
// @access  Private (Admin y Asesor)
const getPricesByPlan = async (req, res) => {
  try {
    const { planId, tipoIngreso } = req.params;
    const prices = await PriceList.getByPlanId(planId, tipoIngreso);
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
    const { tipoIngreso } = req.params;
    if (tipoIngreso !== 'Obligatorio' && tipoIngreso !== 'Voluntario') {
      return res.status(400).json({ message: "El tipo de lista debe ser 'Obligatorio' o 'Voluntario'." });
    }
    const prices = await PriceList.getByType(tipoIngreso);
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
    const { rango_etario, precio } = req.body;
    if (!rango_etario || precio === undefined) {
      return res.status(400).json({ message: 'Debe ingresar los campos: rango_etario y precio.' });
    }

    await PriceList.update(req.params.id, { rango_etario, precio });
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
    // Leemos 'tipo_ingreso' en lugar de 'tipo_lista'
    const { porcentaje, tipo_ingreso } = req.body;

    if (!porcentaje || !tipo_ingreso) {
      return res.status(400).json({ message: 'Debe ingresar el "porcentaje" de aumento y un "tipo de ingreso".' });
    }
    if (tipo_ingreso !== 'Obligatorio' && tipo_ingreso !== 'Voluntario' && tipo_ingreso !== 'Ambas') {
      return res.status(400).json({ message: "El tipo de ingreso debe ser 'Obligatorio', 'Voluntario' o 'Ambas'." });
    }

    const result = await PriceList.applyMassiveIncrease(parseFloat(porcentaje), tipo_ingreso);

    res.status(200).json({
      message: 'Aumento aplicado exitosamente.',
      registros_afectados: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

module.exports = {
  createPriceListBulk,
  getPricesByPlan,
  getPricesByType,
  updatePriceEntry,
  deletePriceEntry,
  applyMassiveIncrease,
};
