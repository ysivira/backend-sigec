//============================================================================
// MODEL: PLANES
//============================================================================= 

const db = require('../config/db');

const Plan = {
  // Crear un nuevo plan
  create: (planData) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO planes (nombre) VALUES (?)';
      db.query(query, [planData.nombre], (err, result) => {
        if (err) return reject(err);
        resolve(result);
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

  // Obtener un plan por su ID (solo si está activo)
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM planes WHERE id = ? AND activo = 1';
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  // Actualizar un plan
  update: (id, planData) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE planes SET nombre = ? WHERE id = ?';
      db.query(query, [planData.nombre, id], (err, result) => {
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