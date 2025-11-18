//============================================================================
// MODELO DE LISTA DE PRECIOS
//============================================================================= 
/**
 * @file priceListModel.js
 * @description Modelo de datos para la tabla de listas de precios.
 * @requires ../config/db
 */

const pool = require('../config/db');

/**
 * @desc    Crear lista de precios (admin)
 * @param {Array<object>} entries - Un array de objetos con los datos de las entradas de precios.
 * @returns {Promise<object>} Resultado de la inserción masiva.
 */
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
    1 // Activo por defecto
  ]);

  const [result] = await pool.query(query, [values]);
  return result;
};

/**
 * @desc    Obtener la lista de precios de un plan específico (sólo activos)
 * @param {number} planId - El ID del plan.
 * @param {string} tipoIngreso - El tipo de ingreso ('Obligatorio', 'Voluntario').
 * @returns {Promise<Array<object>>} Lista de precios para el plan y tipo de ingreso especificados.
 */
const getByPlanId = async (planId, tipoIngreso) => {
  const query = `
    SELECT * FROM listas_de_precios 
    WHERE plan_id = ? AND tipo_ingreso = ? AND activo = 1 
    ORDER BY
      CASE
        WHEN rango_etario LIKE 'MAT%' THEN 2
        WHEN rango_etario LIKE 'HIJO%' THEN 3
        WHEN rango_etario = 'FAMILIAR A CARGO' THEN 4
        ELSE 1
      END,
      rango_etario ASC;
  `;
  const [results] = await pool.query(query, [planId, tipoIngreso]);
  return results;
};

/**
 * @desc    Obtener la lista de precios completa por tipo de lista (sólo activos)
 * @param {string} tipoIngreso - El tipo de ingreso ('Obligatorio', 'Voluntario').
 * @returns {Promise<Array<object>>} Lista de precios para el tipo de ingreso especificado.
 */
const getByType = async (tipoIngreso) => {
  const query = `
    SELECT * FROM listas_de_precios 
    WHERE tipo_ingreso = ? AND activo = 1 
    ORDER BY
      CASE
        WHEN rango_etario LIKE 'MAT%' THEN 2
        WHEN rango_etario LIKE 'HIJO%' THEN 3
        WHEN rango_etario = 'FAMILIAR A CARGO' THEN 4
        ELSE 1
      END,
      rango_etario ASC;
  `;
  const [results] = await pool.query(query, [tipoIngreso]);
  return results;
};

/**
 * @desc    Actualizar una entrada de la lista de precios (admin)
 * @param {number} id - El ID de la entrada de precio a actualizar.
 * @param {object} priceData - Un objeto con los datos a actualizar (rango_etario, precio).
 * @returns {Promise<object>} Resultado de la operación de actualización.
 */
const update = async (id, priceData) => {
  const fields = [];
  const values = [];
  
  if (priceData.precio !== undefined) {
    fields.push('precio = ?');
    values.push(priceData.precio);
  }
  if (priceData.rango_etario !== undefined) {
    fields.push('rango_etario = ?');
    values.push(priceData.rango_etario);
  }

  if (fields.length === 0) {
    return { affectedRows: 0 };
  }

  const query = `UPDATE listas_de_precios SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id); 

  const [result] = await pool.query(query, values);
  return result;
};

/**
 * @desc    Borrado lógico de una entrada de la lista de precios (admin)
 * @param {number} id - El ID de la entrada de precio a eliminar.
 * @returns {Promise<object>} Resultado de la operación de actualización.
 */
const remove = async (id) => {
  const query = 'UPDATE listas_de_precios SET activo = 0 WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result;
};

/**
 * @desc    Aplicar un aumento de precio masivo
 * @param {number} porcentaje - El porcentaje de aumento a aplicar.
 * @param {string} tipoIngreso - El tipo de ingreso al que se aplicará el aumento ('Obligatorio', 'Voluntario', o 'Ambas').
 * @returns {Promise<object>} Resultado de la operación de actualización masiva.
 */
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
 * @param {string} rango_etario - El rango exacto a buscar ('41-50' o 'MAT 41-50').
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