//============================================================================
// MODELO DE LISTA DE PRECIOS
//============================================================================= 
const db = require('../config/db');

const PriceListModel = {
    //crear lista de precios (admin)
   createBulk: (entries) => {
    return new Promise((resolve, reject) => {
      // La consulta para inserción masiva
      const query = `
        INSERT INTO listas_de_precios 
        (lista_nombre, tipo_ingreso, rango_etario, plan_id, precio, activo) 
        VALUES ?
      `;

      // Transformamos el array de objetos a un array de arrays
      const values = entries.map(entry => [
        entry.lista_nombre,
        entry.tipo_ingreso,
        entry.rango_etario,
        entry.plan_id,
        entry.precio,
        1 // Por defecto declaramos activo
      ]);
      
      db.query(query, [values], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

    // Obtener la lista de precios de un plan específico (sólo activos)
   getByPlanId: (planId, tipoIngreso) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM listas_de_precios WHERE plan_id = ? AND tipo_ingreso = ? AND activo = 1';
      db.query(query, [planId, tipoIngreso], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

    // Obtener la lista de precios completa por tipo de lista (sólo activos)
    getByType: (tipoIngreso) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM listas_de_precios WHERE tipo_ingreso = ? AND activo = 1';
      db.query(query, [tipoIngreso], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

    // Actualizar una entrada de la lista de precios (admin)
   update: (id, priceData) => {
    return new Promise((resolve, reject) => {
      const { rango_etario, precio } = priceData;
      const query = 'UPDATE listas_de_precios SET rango_etario = ?, precio = ? WHERE id = ?';
      db.query(query, [rango_etario, precio, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

    // Borrado lógico de una entrada de la lista de precios (admin)
    remove: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE listas_de_precios SET activo = 0 WHERE id = ?';
            db.query(query, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    // Aplicar un aumento de precio masivo
    applyMassiveIncrease: (porcentaje, tipoIngreso) => {
    return new Promise((resolve, reject) => {
      const multiplicador = 1 + porcentaje / 100;
      let query = 'UPDATE listas_de_precios SET precio = precio * ? WHERE activo = 1';
      const params = [multiplicador];

      if (tipoIngreso === 'Obligatorio' || tipoIngreso === 'Voluntario') {
        query += ' AND tipo_ingreso = ?';
        params.push(tipoIngreso);
      }
      // Si se desea actualizar todo no se añade filtro adicional
      
      db.query(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = PriceListModel;