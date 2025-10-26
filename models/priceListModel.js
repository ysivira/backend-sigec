//============================================================================
// MODELO DE LISTA DE PRECIOS
//============================================================================= 

const pool = require('../config/db');

// @desc    Crear lista de precios (admin)
const createBulk = async (entries) => {
  const query = `
    INSERT INTO listas_de_precios 
    (lista_nombre, tipo_ingreso, rango_etario, plan_id, precio, activo) 
    VALUES ?
  `;
  const values = entries.map(entry => [
    entry.lista_nombre,
    entry.tipo_ingreso,
    entry.rango_etario,
    entry.plan_id,
    entry.precio,
    1 // Por defecto declaramos activo
  ]);

  const [result] = await pool.query(query, [values]);
  return result;
};

// @desc    Obtener la lista de precios de un plan específico (sólo activos)
const getByPlanId = async (planId, tipoIngreso) => {
  const query = 'SELECT * FROM listas_de_precios WHERE plan_id = ? AND tipo_ingreso = ? AND activo = 1';
  const [results] = await pool.query(query, [planId, tipoIngreso]);
  return results;
};

// @desc    Obtener la lista de precios completa por tipo de lista (sólo activos)
const getByType = async (tipoIngreso) => {
  const query = 'SELECT * FROM listas_de_precios WHERE tipo_ingreso = ? AND activo = 1';
  const [results] = await pool.query(query, [tipoIngreso]);
  return results;
};

// @desc    Actualizar una entrada de la lista de precios (admin)
const update = async (id, priceData) => {
  const { rango_etario, precio } = priceData;
  const query = 'UPDATE listas_de_precios SET rango_etario = ?, precio = ? WHERE id = ?';
  const [result] = await pool.query(query, [rango_etario, precio, id]);
  return result;
};

// @desc    Borrado lógico de una entrada de la lista de precios (admin)
const remove = async (id) => {
  const query = 'UPDATE listas_de_precios SET activo = 0 WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result;
};

// @desc    Aplicar un aumento de precio masivo
const applyMassiveIncrease = async (porcentaje, tipoIngreso) => {
  const multiplicador = 1 + parseFloat(porcentaje) / 100;
  let query = 'UPDATE listas_de_precios SET precio = precio * ? WHERE activo = 1';
  const params = [multiplicador];

  if (tipoIngreso === 'Obligatorio' || tipoIngreso === 'Voluntario') {
    query += ' AND tipo_ingreso = ?';
    params.push(tipoIngreso);
  }

  const [result] = await pool.query(query, params);
  return result;
};

/**
 * Busca un precio específico en la lista de precios.
 *
 * @param {number} plan_id - El ID del plan (ej: 1).
 * @param {string} tipo_ingreso - (ej: 'Obligatorio').
 * @param {string} rango_etario - El rango exacto a buscar (ej: '41-50' o 'MAT 41-50').
 * @returns {Promise<number>} - El precio encontrado.
 */
const findPrecio = async (plan_id, tipo_ingreso, rango_etario) => {

  const [rows] = await pool.query(
    `SELECT precio FROM listas_de_precios 
     WHERE plan_id = ? AND tipo_ingreso = ? AND rango_etario = ? AND activo = 1`,
    [plan_id, tipo_ingreso, rango_etario]
  );

  if (rows.length === 0) {
    // Si no encuentra el precio, es un error crítico de datos
    throw new Error(`Precio no encontrado para: Plan=${plan_id}, Tipo=${tipo_ingreso}, Rango=${rango_etario}`);
  }

  return parseFloat(rows[0].precio);
};

module.exports = {
  createBulk,
  getByPlanId,
  getByType,
  update,
  remove,
  applyMassiveIncrease,
  findPrecio
};