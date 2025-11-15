//============================================================================
// MODELO DE EMPLEADO
//============================================================================
/**
 * @file employeeModel.js
 * @description Modelo de datos para la tabla de empleados.
 * @requires ../config/db
 */

const pool = require('../config/db');

/**
 * Crea un nuevo empleado en la base de datos.
 * @param {object} employeeData - Datos del empleado a crear.
 * @returns {Promise<object>} Resultado de la operación de inserción.
 */
const create = async (employeeData) => {
  const {
    legajo, nombre, segundo_nombre, apellido, segundo_apellido,
    email, telefono, direccion, hashedPassword,
    reset_password_token, 
    reset_password_expires
  } = employeeData;

  const query = `
    INSERT INTO empleados 
    (legajo, nombre, segundo_nombre, apellido, segundo_apellido, 
     email, telefono, direccion, password, 
     rol, estado, supervisor_id, fecha_creacion, email_confirmado,
     reset_password_token, reset_password_expires 
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'asesor', 'inactivo', NULL, NOW(), 0, ?, ?)
  `;

  const values = [
    legajo, nombre, segundo_nombre, apellido, segundo_apellido,
    email, telefono, direccion, hashedPassword,
    reset_password_token, 
    reset_password_expires
  ];

  const [result] = await pool.query(query, values);
  return result;
};

/**
 * Busca un empleado por su número de legajo.
 * @param {string|number} legajo - El legajo del empleado a buscar.
 * @returns {Promise<object|undefined>} El objeto del empleado si se encuentra, de lo contrario undefined.
 */
const findByLegajo = async (legajo) => {
  const query = 'SELECT * FROM empleados WHERE legajo = ?';
  const [results] = await pool.query(query, [legajo]);
  return results[0];
};

/**
 * Obtiene todos los empleados, con un filtro opcional por estado.
 * @param {string|null} [estado=null] - El estado por el cual filtrar los empleados ('activo', 'inactivo').
 * @returns {Promise<Array<object>>} Un array con los empleados encontrados.
 */
const findAll = async (estado = null) => {
  let query = 'SELECT legajo, nombre, apellido, email, rol, estado, supervisor_id, email_confirmado FROM empleados';
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
 * Actualiza los detalles de un empleado (estado, rol, supervisor_id, etc.).
 * @param {string|number} legajo - El legajo del empleado a actualizar.
 * @param {object} data - Un objeto con los campos a actualizar.
 * @returns {Promise<object>} Resultado de la operación de actualización.
 */
const updateDetails = async (legajo, data) => {
  let fields = [];
  let values = [];

  if (data.nombre) {
    fields.push('nombre = ?');
    values.push(data.nombre);
  }
  if (data.segundo_nombre) {
    fields.push('segundo_nombre = ?');
    values.push(data.segundo_nombre);
  }
  if (data.apellido) {
    fields.push('apellido = ?');
    values.push(data.apellido);
  }
  if (data.segundo_apellido) {
    fields.push('segundo_apellido = ?');
    values.push(data.segundo_apellido);
  }
  if (data.email) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.telefono) {
    fields.push('telefono = ?');
    values.push(data.telefono);
  }
  if (data.direccion) {
    fields.push('direccion = ?');
    values.push(data.direccion);
  }
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
 * Marca el email de un empleado como confirmado (email_confirmado = 1).
 * @param {string|number} legajo - El legajo del empleado.
 * @returns {Promise<object>} Resultado de la operación de actualización.
 */
const confirmEmail = async (legajo) => {
  const query = 'UPDATE empleados SET email_confirmado = 1 WHERE legajo = ? AND email_confirmado = 0';
  const [result] = await pool.query(query, [legajo]);
  return result;
};

/**
 * Busca un empleado por su dirección de email.
 * @param {string} email - El email del empleado a buscar.
 * @returns {Promise<object|undefined>} El objeto del empleado si se encuentra, de lo contrario undefined.
 */
const findByEmail = async (email) => {
  try {
    const [rows] = await pool.query('SELECT * FROM empleados WHERE email = ? AND estado = 1', [email]);
    return rows[0];
  } catch (error) {
    console.error('Error en findByEmail (Model):', error);
    throw new Error('Error al buscar empleado por email.');
  }
};

/**
 * Guarda el token de reseteo de contraseña y su fecha de expiración en la base de datos.
 * @param {string|number} legajo - El legajo del empleado.
 * @param {string} token - El token de reseteo hasheado.
 * @param {Date} expires - La fecha y hora de expiración del token.
 * @returns {Promise<boolean>} `true` si la operación fue exitosa, de lo contrario `false`.
 */
const saveResetToken = async (legajo, token, expires) => {
  try {
    const [result] = await pool.query(
      'UPDATE empleados SET reset_password_token = ?, reset_password_expires = ? WHERE legajo = ?',
      [token, expires, legajo]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en saveResetToken (Model):', error);
    throw new Error('Error al guardar el token de reseteo.');
  }
};

/**
 * Busca un empleado por un token de reseteo de contraseña válido (no expirado).
 * @param {string} token - El token de reseteo hasheado.
 * @returns {Promise<object|undefined>} El objeto del empleado si se encuentra, de lo contrario undefined.
 */
const findByResetToken = async (token) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM empleados WHERE reset_password_token = ? AND reset_password_expires > NOW()',
      [token]
    );
    return rows[0];
  } catch (error) {
    console.error('Error en findByResetToken (Model):', error);
    throw new Error('Error al buscar por token de reseteo.');
  }
};

/**
 * Actualiza la contraseña de un empleado y limpia los campos del token de reseteo.
 * @param {string|number} legajo - El legajo del empleado.
 * @param {string} hashedPassword - La nueva contraseña hasheada.
 * @returns {Promise<boolean>} `true` si la operación fue exitosa, de lo contrario `false`.
 */
const updatePasswordAndClearToken = async (legajo, hashedPassword) => {
  try {
    const [result] = await pool.query(
      'UPDATE empleados SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE legajo = ?',
      [hashedPassword, legajo]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en updatePasswordAndClearToken (Model):', error);
    throw new Error('Error al actualizar la contraseña.');
  }
};

module.exports = {
  create,
  findByLegajo,
  findAll,
  updateDetails,
  confirmEmail,
  findByEmail,
  saveResetToken,
  findByResetToken,
  updatePasswordAndClearToken,
};