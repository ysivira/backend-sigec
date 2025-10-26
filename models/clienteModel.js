//============================================================================
// MODELO DE CLIENTE
//============================================================================= 

const pool = require('../config/db');

/**
 * Busca un cliente por DNI (solo activos).
 * @param {string} dni - DNI del cliente.
 * @returns {Promise<object|undefined>} El cliente encontrado o undefined.
 */
const findByDni = async (dni) => {
  const query = 'SELECT * FROM clientes WHERE dni = ? AND activo = 1';
  const [results] = await pool.query(query, [dni]);
  return results[0];
};

/**
 * Crea un nuevo cliente.
 * @param {object} clienteData - Datos del cliente.
 * @returns {Promise<object>} Resultado de la inserción 
 */
const create = async (clienteData) => {
  const {
    dni,
    nombres,
    apellidos,
    email,
    telefono,
    asesor_captador_id,
  } = clienteData;

  const query = `
    INSERT INTO clientes 
    (dni, nombres, apellidos, email, telefono, asesor_captador_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
    dni, nombres, apellidos, email, telefono, asesor_captador_id
  ]);
  return result;
};

/**
 * Busca clientes por asesor (solo activos).
 * @param {string|number} asesorId - Legajo del asesor.
 * @returns {Promise<Array<object>>} Lista de clientes.
 */
const findClientesByAsesor = async (asesorId) => {
  const query = `
    SELECT id, dni, nombres, apellidos, email, telefono 
    FROM clientes 
    WHERE asesor_captador_id = ? AND activo = 1
    ORDER BY apellidos, nombres
  `;
  const [results] = await pool.query(query, [asesorId]);
  return results;
};

/**
 * Actualiza datos de un cliente.
 * @param {number} id - ID del cliente.
 * @param {object} clienteData - Datos a actualizar.
 * @returns {Promise<object>} Resultado del update.
 */
const update = async (id, clienteData) => {
  const {
    nombres, apellidos, email, telefono,
    direccion, codigo_postal, ciudad, provincia
  } = clienteData;

  const query = `
    UPDATE clientes SET 
      nombres = ?, apellidos = ?, email = ?, telefono = ?, 
      direccion = ?, codigo_postal = ?, ciudad = ?, provincia = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(query, [
    nombres, apellidos, email, telefono,
    direccion, codigo_postal, ciudad, provincia,
    id
  ]);
  return result;
};

/**
 * Busca cliente por ID (solo activos).
 * @param {number} id - ID del cliente.
 * @returns {Promise<object|undefined>} El cliente encontrado o undefined.
 */
const findById = async (id) => {
  const query = 'SELECT * FROM clientes WHERE id = ? AND activo = 1';
  const [results] = await pool.query(query, [id]);
  return results[0];
};

module.exports = {
  findByDni,
  create,
  findClientesByAsesor,
  update,
  findById,
};