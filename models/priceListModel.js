//============================================================================
// MODELO DE LISTA DE PRECIOS
//============================================================================= 
const db = require('../config/db');

const PriceListModel = {
    //crear lista de precios (admin)
    create: (priceData) => {
        return new Promise((resolve, reject) => {
            const { plan_id, tipo_lista, edad_min, edad_max, precio } = priceData;
            const query = 'INSERT INTO listas_de_precios (plan_id, tipo_lista, edad_min, edad_max, precio) VALUES ( ?,?,?,?,?)';
            db.query(query, [plan_id, tipo_lista, edad_min, edad_max, precio], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    // Obtener la lista de precios de un plan específico (sólo activos)
    getByPlanId: (planId, tipoLista) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM listas_de_precios WHERE plan_id = ? AND tipo_lista = ? AND activo = 1';
            db.query(query, [planId, tipoLista], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // Obtener la lista de precios completa por tipo de lista (sólo activos)
    getByType: (tipoLista) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM listas_de_precios WHERE tipo_lista = ? AND activo = 1';
            db.query(query, [tipoLista], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // Actualizar una entrada de la lista de precios (admin)
    update: (id, priceData) => {
        return new Promise((resolve, reject) => {
            const { edad_min, edad_max, precio } = priceData;
            const query = 'UPDATE listas_de_precios SET edad_min = ?, edad_max = ?, precio = ? WHERE id = ?';
            db.query(query, [edad_min, edad_max, precio, id], (err, result) => {
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
};

module.exports = PriceListModel;