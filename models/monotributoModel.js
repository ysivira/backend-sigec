//============================================================================
// MODELO DE MONOTRIBUTO
//============================================================================= 
/**
 * @file monotributoModel.js
 * @description Modelo de datos para la tabla de aportes de monotributo.
 * @requires ../config/db
 */

const pool = require('../config/db');

/**
 * Busca el valor del aporte de monotributo para una categoría específica.
 * @param {string} categoria - La categoría a buscar ('A', 'B', 'D').
 * @returns {Promise<number>} - El valor del aporte.
 */
const findAporteByCategoria = async (categoria) => {
  try {
    const [rows] = await pool.query(
      'SELECT aporte FROM monotributo_aportes WHERE categoria = ?',
      [categoria]
    );
    if (rows.length === 0) {
      throw new Error(`No se encontró aporte para la categoría: ${categoria}`);
    }
    return parseFloat(rows[0].aporte);
  } catch (error) {
    console.error('Error en findAporteByCategoria:', error);
    throw error;
  }
};

/**
 * Busca el valor del aporte de monotributo para un 'Adherente'.
 * @returns {Promise<number>} - El valor del aporte.
 */
const findAporteAdherente = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT aporte FROM monotributo_aportes WHERE categoria = "Adherente"',
      []
    );
    if (rows.length === 0) {
      throw new Error('No se encontró el valor de aporte para Adherente.');
    }
    return parseFloat(rows[0].aporte);
  } catch (error) {
    console.error('Error en findAporteAdherente:', error);
    throw error;
  }
};

module.exports = {
  findAporteByCategoria,
  findAporteAdherente
};