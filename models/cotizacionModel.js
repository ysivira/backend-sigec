//=================================================================
// MODELO DE COTIZACION
//=================================================================

const db = require('../config/db');

const Cotizacion = {

    // Función de búsqueda de la última cotización por DNI
    findLastCotizationByDni: (dni) => {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT 
          c.id AS cotizacion_id, c.fecha_creacion, c.estado,
          p.nombre AS plan_nombre,
          e.legajo AS asesor_legajo, e.nombre AS asesor_nombre, e.apellido AS asesor_apellido
        FROM cotizaciones c
        JOIN empleados e ON c.asesor_id = e.legajo
        JOIN planes p ON c.plan_id = p.id
        JOIN clientes cl ON c.cliente_id = cl.id
        WHERE cl.dni = ? AND c.activo = 1
        ORDER BY c.fecha_creacion DESC
        LIMIT 1
      `;
            db.query(query, [dni], (err, results) => {
                if (err) return reject(err);
                resolve(results[0] || null);
            });
        });
    },

    // Crear cotización completa con miembros
    createFullCotizacion: (cotizacionData, miembros) => {
        return new Promise(async (resolve, reject) => {

            try {
                const {
                    cliente_id, asesor_id, plan_id, tipo_ingreso, sueldo_bruto,
                    categoria_monotributo, descuento_comercial, descuento_afinidad,
                    valor_total, estado, pdf_ruta_almacenamiento
                } = cotizacionData;

                const cotizacionQuery = `
          INSERT INTO cotizaciones 
          (cliente_id, asesor_id, plan_id, tipo_ingreso, sueldo_bruto, categoria_monotributo, 
           descuento_comercial, descuento_afinidad, valor_total, fecha_creacion, estado, pdf_ruta_almacenamiento, activo) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
        `;

                const cotizacionValues = [
                    cliente_id, asesor_id, plan_id, tipo_ingreso, sueldo_bruto || null,
                    categoria_monotributo || null, descuento_comercial || 0.00, descuento_afinidad || 0.00,
                    valor_total || 0.00, estado || 'cotizado', pdf_ruta_almacenamiento || null, 1
                ];

                const cotizacionResult = await new Promise((res, rej) => {
                    db.query(cotizacionQuery, cotizacionValues, (err, result) => {
                        if (err) return rej(err);
                        res(result);
                    });
                });
                const cotizacionId = cotizacionResult.insertId;

                // Insertar miembros 
                if (miembros && miembros.length > 0) {
                    const miembrosQuery = `
              INSERT INTO miembros_cotizacion (cotizacion_id, parentesco, edad, valor_individual) 
              VALUES ?
          `;
                    const miembrosValues = miembros.map(m => [
                        cotizacionId, m.parentesco, m.edad, m.valor_individual || 0.00,
                    ]);

                    await new Promise((res, rej) => {
                        db.query(miembrosQuery, [miembrosValues], (err, result) => {
                            if (err) return rej(err);
                            res(result);
                        });
                    });
                }

                resolve({ id: cotizacionId, message: 'Cotización creada exitosamente' });

            } catch (error) {
                console.error('Error en createFullCotizacion:', error);
                reject(new Error('Fallo en la secuencia de insercion de cotización/miembros.'));
            }
        });
    },

    //Buscar cotización por ID incluyendo miembros
    findCotizacionById: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Obtener la cotización principal, el cliente y el plan
                const cotizacionQuery = `
          SELECT 
            c.*, 
            cl.dni, cl.nombres, cl.apellidos, cl.email, cl.telefono,
            p.nombre as plan_nombre
          FROM cotizaciones c
          JOIN clientes cl ON c.cliente_id = cl.id
          JOIN planes p ON c.plan_id = p.id
          WHERE c.id = ?
        `;
                const [cotizacionResult] = await db.promise().query(cotizacionQuery, [id]);

                if (!cotizacionResult || cotizacionResult.length === 0) {
                    return resolve(null); // No se encontró la cotización
                }

                const cotizacion = cotizacionResult[0];

                // Obtener todos los miembros de esa cotización
                const miembrosQuery = `
          SELECT parentesco, edad, valor_individual 
          FROM miembros_cotizacion 
          WHERE cotizacion_id = ?
        `;
                const [miembrosResult] = await db.promise().query(miembrosQuery, [id]);

                // Combinar todo en un solo objeto
                const cotizacionCompleta = {
                    ...cotizacion,
                    miembros: miembrosResult
                };

                resolve(cotizacionCompleta);

            } catch (error) {
                reject(error);
            }
        });
    },

    // Buscar todas las cotizaciones de un asesor
    findCotizacionesByAsesor: (asesorId) => {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT 
          c.id, c.fecha_creacion, c.estado, c.valor_total,
          cl.nombres AS cliente_nombres, 
          cl.apellidos AS cliente_apellidos, 
          cl.dni AS cliente_dni,
          p.nombre AS plan_nombre,
          COUNT(mc.id) AS cantidad_miembros 
        FROM cotizaciones c
        JOIN clientes cl ON c.cliente_id = cl.id
        JOIN planes p ON c.plan_id = p.id
        LEFT JOIN miembros_cotizacion mc ON c.id = mc.cotizacion_id
        WHERE c.asesor_id = ? AND c.activo = 1
        GROUP BY c.id
        ORDER BY c.fecha_creacion DESC
      `;
            db.query(query, [asesorId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }


};

module.exports = Cotizacion;