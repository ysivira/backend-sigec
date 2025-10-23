//============================================================================
// MODEL: PLANES
//============================================================================= 

const db = require('../config/db');

const Plan = {
  // Crear un nuevo plan
  create: (planData) => {
    return new Promise((resolve, reject) => {
      
      const { nombre, detalles, condiciones_generales } = planData;
      
      const query = `
        INSERT INTO planes (nombre, detalles, condiciones_generales, activo) 
        VALUES (?, ?, ?, 1)
      `;
      
      db.query(query, [nombre, detalles, condiciones_generales], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  },

  // Obtener todos los planes activos 
  getAll: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM planes WHERE activo = 1';
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Función para obtener un plan ACTIVO (para Asesores)
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM planes WHERE id = ? AND activo = 1';
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  // Función para obtener TODOS los planes (para Admin)
  getAllAdmin: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM planes ORDER BY nombre';
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Actualizar un plan
  update: (id, planData) => {
    return new Promise((resolve, reject) => {
      
      const { nombre, detalles, condiciones_generales, activo } = planData;
      
      const query = `
        UPDATE planes SET 
          nombre = ?, 
          detalles = ?, 
          condiciones_generales = ?,
          activo = ?
        WHERE id = ?
      `;
      
      db.query(query, [nombre, detalles, condiciones_generales, activo, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  // Borrado lógico de un plan
  remove: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE planes SET activo = 0 WHERE id = ?';
      db.query(query, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
};

module.exports = Plan;