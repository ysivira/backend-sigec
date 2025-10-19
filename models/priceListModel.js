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

    // Aplicar un aumento de precio masivo
    applyMassiveIncrease: (porcentaje, tipoLista) => {
        return new Promise((resolve, reject) => {
            // Convertimos el porcentaje (ej: 15) a un multiplicador (ej: 1.15)
            const multiplicador = 1 + porcentaje / 100;

            let query = 'UPDATE listas_de_precios SET precio = precio * ? WHERE activo = 1';
            const params = [multiplicador];

            // Añadimos la condición del tipo de lista 
            if (tipoLista === 'Obligatoria') {
                query += ' AND tipo_lista = ?';
                params.push('Obligatoria');
            } else if (tipoLista === 'Voluntaria') {
                query += ' AND tipo_lista = ?';
                params.push('Voluntaria');
            }
            // Si tipoLista es 'Ambas', no añadimos más condiciones, por lo que se aplica a todas por como fue creado el query.

            db.query(query, params, (err, result) => {
                if (err) return reject(err);
                // result.affectedRows nos dirá cuántos precios se actualizaron
                resolve(result);
            });
        });
    }
};

module.exports = PriceListModel;