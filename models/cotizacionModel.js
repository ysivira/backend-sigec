//============================================================================
// MODELO: COTIZACIONES 
//=============================================================================
const db = require('../config/db');

const Cotizacion = {
    // Funcion: Buscar la ultima cotizacion de un cliente por DNI
    findLastCotizationByDni: (dni) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    c.id AS cotizacion_id, 
                    c.fecha_creacion, 
                    c.estado,
                    p.nombre AS plan_nombre,
                    e.legajo AS asesor_legajo,
                    e.nombre AS asesor_nombre,
                    e.apellido AS asesor_apellido
                FROM cotizaciones c
                JOIN empleados e ON c.asesor_id = e.legajo
                JOIN planes p ON c.plan_id = p.id
                WHERE c.cliente_id = ? AND c.activo = 1
                ORDER BY c.fecha_creacion DESC
                LIMIT 1
            `;
            db.query(query, [dni], (err, results) => {
                if (err) return reject(err);
                // Si no hay resultados, devuelve null.
                resolve(results[0] || null); 
            });
        });
    },
};

module.exports = Cotizacion;
