//=================================================================
// MODELO DE COTIZACION
//=================================================================

const db = require('../config/db'); 

const Cotizacion = {
  
  // Función de búsqueda 
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
          valor_total || 0.00, estado || 'borrador', pdf_ruta_almacenamiento || null, 1
        ];

        // ¡Insertamos usando db.query 
        const cotizacionResult = await new Promise((res, rej) =>{
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
  } 
}; 

module.exports = Cotizacion;