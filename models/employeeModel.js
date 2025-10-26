//============================================================================
// MODELO DE EMPLEADO
//============================================================================= 

const pool = require('../config/db');

/**
 * Crea un nuevo empleado (asesor).
 * @param {object} employeeData - Datos del empleado.
 * @returns {Promise<object>} Resultado de la inserción.
 */
const create = async (employeeData) => {
  const {
    legajo, nombre, segundo_nombre, apellido, segundo_apellido,
    email, telefono, direccion, hashedPassword,
  } = employeeData;

  const query = `
    INSERT INTO empleados 
    (legajo, nombre, segundo_nombre, apellido, segundo_apellido, 
     email, telefono, direccion, password, 
     rol, estado, supervisor_id, fecha_creacion, email_confirmado) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'asesor', 'inactivo', NULL, NOW(), 0)
  `;

  const values = [
    legajo, nombre, segundo_nombre, apellido, segundo_apellido,
    email, telefono, direccion, hashedPassword,
  ];

  const [result] = await pool.query(query, values);
  return result;
};

/**
 * Busca un empleado por su legajo.
 * @param {string|number} legajo - Legajo del empleado.
 * @returns {Promise<object|undefined>} El empleado encontrado o undefined.
 */
const findByLegajo = async (legajo) => {
  const query = 'SELECT * FROM empleados WHERE legajo = ?';
  const [results] = await pool.query(query, [legajo]);
  return results[0]; // Retorna el resultado directo
};

/**
 * Obtener todos los empleados, con filtro opcional de estado.
 * @param {string|null} estado - Estado para filtrar (ej: 'activo') o null.
 * @returns {Promise<Array<object>>} Lista de empleados.
 */
const findAll = async (estado = null) => {
  let query = 'SELECT legajo, nombre, apellido, email, rol, estado, supervisor_id FROM empleados';
  const params = [];

  if (estado) {
    query += ' WHERE estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY apellido ASC';

  const [results] = await pool.query(query, params);
  return results;
};

/**
 * Actualiza los detalles de un empleado (estado, rol, supervisor_id).
 * @param {string|number} legajo - Legajo del empleado a actualizar.
 * @param {object} data - Datos a actualizar (ej: { estado: 'activo' }).
 * @returns {Promise<object>} Resultado del update.
 */
const updateDetails = async (legajo, data) => {
  let fields = [];
  let values = [];

  if (data.estado) {
    fields.push('estado = ?');
    values.push(data.estado);
  }
  if (data.rol) {
    fields.push('rol = ?');
    values.push(data.rol);
  }
  if (data.supervisor_id !== undefined) {
    fields.push('supervisor_id = ?');
    values.push(data.supervisor_id);
  }
  if (data.email_confirmado !== undefined) {
    fields.push('email_confirmado = ?');
    values.push(data.email_confirmado);
  }

  if (fields.length === 0) {
    return { affectedRows: 0, message: 'No hay campos para actualizar.' };
  }

  let query = `UPDATE empleados SET ${fields.join(', ')} WHERE legajo = ?`;
  values.push(legajo);

  const [result] = await pool.query(query, values);
  return result;
};

/**
 * Confirma el email de un empleado (email_confirmado = 1).
 * @param {string|number} legajo - Legajo del empleado.
 * @returns {Promise<object>} Resultado del update.
 */
const confirmEmail = async (legajo) => {
  const query = 'UPDATE empleados SET email_confirmado = 1 WHERE legajo = ? AND email_confirmado = 0';
  const [result] = await pool.query(query, [legajo]);
  return result;
};

module.exports = {
  create,
  findByLegajo,
  findAll,
  updateDetails,
  confirmEmail,
};