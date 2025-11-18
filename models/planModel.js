//============================================================================
// MODEL: PLANES
//============================================================================= 
/**
 * @file planModel.js
 * @description Modelo de datos para la tabla de planes.
 * @requires ../config/db
 */

const pool = require('../config/db');

/**
 * Crear un nuevo plan.
 * @param {object} planData - Datos del plan.
 * @returns {Promise<number>} ID del plan insertado.
 */
const create = async (planData) => {
  const { nombre, detalles, condiciones_generales } = planData;
  const query = `
    INSERT INTO planes (nombre, detalles, condiciones_generales, activo) 
    VALUES (?, ?, ?, 1)
  `;

  const [result] = await pool.query(query, [nombre, detalles, condiciones_generales]);
  return result.insertId;
};

/**
 * Obtener todos los planes (solo activos).
 * @returns {Promise<Array<object>>} Lista de planes.
 */
const getAll = async () => {
  const query = 'SELECT * FROM planes WHERE activo = 1';
  const [results] = await pool.query(query);
  return results;
};

/**
 * Obtener un plan ACTIVO por ID (para Asesores).
 * @param {number} id - ID del plan.
 * @returns {Promise<object|undefined>} El plan encontrado o undefined.
 */
const getById = async (id) => {
  const query = 'SELECT * FROM planes WHERE id = ? AND activo = 1';
  const [results] = await pool.query(query, [id]);
  return results[0];
};

/**
 * Obtener TODOS los planes (para Admin, activos e inactivos).
 * @returns {Promise<Array<object>>} Lista de todos los planes.
 */
const getAllAdmin = async () => {
  const query = 'SELECT * FROM planes ORDER BY id ASC';
  const [results] = await pool.query(query);
  return results;
};

/**
 * Actualizar un plan.
 * @param {number} id - ID del plan.
 * @param {object} planData - Datos a actualizar.
 * @returns {Promise<object>} Resultado del update.
 */
const update = async (id, planData) => {
  const fields = [];
  const values = [];

  if (planData.nombre !== undefined) {
    fields.push('nombre = ?');
    values.push(planData.nombre);
  }
  if (planData.detalles !== undefined) {
    fields.push('detalles = ?');
    values.push(planData.detalles);
  }
  if (planData.condiciones_generales !== undefined) {
    fields.push('condiciones_generales = ?');
    values.push(planData.condiciones_generales);
  }
  if (planData.activo !== undefined) {
    fields.push('activo = ?');
    values.push(planData.activo);
  }

  if (fields.length === 0) {
    return { affectedRows: 0 };
  }

  const query = `UPDATE planes SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  const [result] = await pool.query(query, values);
  return result;
};

/**
 * Borrado lógico de un plan (activo = 0).
 * @param {number} id - ID del plan.
 * @returns {Promise<object>} Resultado del update.
 */
const remove = async (id) => {
  const query = 'UPDATE planes SET activo = 0 WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result;
};

module.exports = {
  create,
  getAll,
  getById,
  getAllAdmin,
  update,
  remove,
};