//=================================================================
// MODELO DE COTIZACION
//=================================================================
/**
 * @file cotizacionModel.js
 * @description Modelo de datos para la tabla de cotizaciones.
 * @requires ../config/db
 */

const pool = require('../config/db');

/**
 * Crea la cotización completa (Cabecera y Miembros) en una transacción.
 *
 * @param {object} cotizacionData - Datos de la tabla 'cotizaciones' 
 * @param {Array<object>} miembrosData - Array de miembros para 'miembros_cotizacion'.
 * @returns {Promise<object>} - El resultado de la inserción.
 */
const createFullCotizacion = async (cotizacionData, miembrosData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Inserta la Cabecera (cotizaciones)
    const queryCabecera = `
     INSERT INTO cotizaciones
        (cliente_id, asesor_id, plan_id, tipo_ingreso, es_casado,
        aporte_obra_social, descuento_comercial_pct, descuento_afinidad_pct,
        descuento_joven_pct, valor_descuento_joven, 
        descuento_tarjeta_pct, valor_descuento_tarjeta,
        monotributo_categoria, monotributo_adherentes, comentarios, url_pdf,
        valor_base_plan, valor_descuento_comercial, valor_descuento_afinidad,
        sueldo_bruto, valor_aportes_estimados, valor_aporte_monotributo,
        valor_iva, valor_total, estado, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cotizado', 1) 
      `;
    const [resultCabecera] = await connection.query(queryCabecera, [
      cotizacionData.cliente_id, cotizacionData.asesor_id, cotizacionData.plan_id,
      cotizacionData.tipo_ingreso, cotizacionData.es_casado,
      cotizacionData.aporte_obra_social || null,
      cotizacionData.descuento_comercial_pct || 0,
      cotizacionData.descuento_afinidad_pct || 0,
      cotizacionData.descuento_joven_pct || 0,
      cotizacionData.valor_descuento_joven || 0,
      cotizacionData.descuento_tarjeta_pct || 0,
      cotizacionData.valor_descuento_tarjeta || 0,
      cotizacionData.monotributo_categoria || null,
      cotizacionData.monotributo_adherentes || 0,
      cotizacionData.comentarios || null,
      null, // URL PDF se actualiza luego
      cotizacionData.valor_base_plan,
      cotizacionData.valor_descuento_comercial,
      cotizacionData.valor_descuento_afinidad,
      cotizacionData.sueldo_bruto,
      cotizacionData.valor_aportes_estimados,
      cotizacionData.valor_aporte_monotributo,
      cotizacionData.valor_iva,
      cotizacionData.valor_total
    ]);

    const cotizacionId = resultCabecera.insertId;

    // Actualiza la cotización que acaba de crear con su propia URL.
    const url_pdf = `/api/cotizaciones/${cotizacionId}/pdf`;
    await connection.query('UPDATE cotizaciones SET url_pdf = ? WHERE id = ?', [
      url_pdf,
      cotizacionId,
    ]);

    // 2. Insertar los Miembros
    const queryMiembros = `
      INSERT INTO miembros_cotizacion 
      (cotizacion_id, parentesco, edad, valor_individual) 
      VALUES ?
    `;
    const miembrosValues = miembrosData.map(m => [
      cotizacionId,
      m.parentesco,
      m.edad,
      parseFloat(m.valor_individual) || 0
    ]);
    await connection.query(queryMiembros, [miembrosValues]);

    await connection.commit();
    return { id: cotizacionId, message: 'Cotización creada exitosamente.' };

  } catch (error) {
    await connection.rollback();
    console.error('Error en createFullCotizacion (Model):', error);
    throw new Error('Error en el servidor al guardar la cotización.');
  } finally {
    connection.release();
  }
};

/**
 * Actualiza la cotización completa (Cabecera y Miembros) en una transacción.
 *
 * @param {number} cotizacionId // ID de la cotización a actualizar
 * @param {object} cotizacionData // Datos de la tabla 'cotizaciones'
 * @param {Array<object>} miembrosData // Array de miembros para 'miembros_cotizacion'.
 * @returns {Promise<object>}
 */
const updateFullCotizacion = async (cotizacionId, cotizacionData, miembrosData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const url_pdf = `/api/cotizaciones/${cotizacionId}/pdf`;

    // Actualiza la Cabecera (cotizaciones) 
    const queryCabecera = `
      UPDATE cotizaciones SET
        plan_id = ?, tipo_ingreso = ?, es_casado = ?,
        aporte_obra_social = ?, descuento_comercial_pct = ?, descuento_afinidad_pct = ?,
        descuento_joven_pct = ?, valor_descuento_joven = ?, descuento_tarjeta_pct = ?, valor_descuento_tarjeta = ?,
        monotributo_categoria = ?, monotributo_adherentes = ?, comentarios = ?,
        valor_base_plan = ?, valor_descuento_comercial = ?, valor_descuento_afinidad = ?,
        sueldo_bruto = ?, valor_aportes_estimados = ?, valor_aporte_monotributo = ?,
        valor_iva = ?, valor_total = ?,
        url_pdf = ?,
        activo = 1, estado = 'cotizado'
      WHERE id = ?
    `;

    await connection.query(queryCabecera, [
      cotizacionData.plan_id, cotizacionData.tipo_ingreso, cotizacionData.es_casado,
      cotizacionData.aporte_obra_social || 0,
      cotizacionData.descuento_comercial_pct || 0,
      cotizacionData.descuento_afinidad_pct || 0,
      cotizacionData.descuento_joven_pct || 0,
      cotizacionData.valor_descuento_joven || 0,
      cotizacionData.descuento_tarjeta_pct || 0,
      cotizacionData.valor_descuento_tarjeta || 0,
      cotizacionData.monotributo_categoria || null,
      cotizacionData.monotributo_adherentes || 0,
      cotizacionData.comentarios || null,
      cotizacionData.valor_base_plan || 0,
      cotizacionData.valor_descuento_comercial || 0,
      cotizacionData.valor_descuento_afinidad || 0,
      cotizacionData.sueldo_bruto || 0,
      cotizacionData.valor_aportes_estimados || 0,
      cotizacionData.valor_aporte_monotributo || 0,
      cotizacionData.valor_iva || 0,
      cotizacionData.valor_total || 0,
      url_pdf,
      cotizacionId
    ]);

    // Borrar Miembros Antiguos
    await connection.query('DELETE FROM miembros_cotizacion WHERE cotizacion_id = ?', [cotizacionId]);

    // Inserta Miembros Nuevos
    if (miembrosData && miembrosData.length > 0) {
      const queryMiembros = `
        INSERT INTO miembros_cotizacion
        (cotizacion_id, parentesco, edad, valor_individual)
        VALUES ?
        `;

      const miembrosValues = miembrosData.map(m => [
        cotizacionId, m.parentesco, m.edad,
        parseFloat(m.valor_individual) || 0
      ]);
      await connection.query(queryMiembros, [miembrosValues]);
    }

    await connection.commit();
    return { id: cotizacionId, message: 'Cotización actualizada exitosamente.' };

  } catch (error) {
    await connection.rollback();
    console.error('Error en updateFullCotizacion (Model):', error);
    throw new Error('Error en el servidor al actualizar la cotización.');
  } finally {
    connection.release();
  }
};

/**
 * Busca la última cotización de un cliente por DNI (solo activos).
 * @param {string} dni - El DNI del cliente a buscar.
 * @returns {Promise<object|undefined>} La última cotización si se encuentra, de lo contrario undefined.
 */
const findLastCotizationByDni = async (dni) => {
  const query = `
    SELECT 
      c.id AS cotizacion_id, c.fecha_creacion, c.asesor_id AS asesor_legajo,
      e.nombre AS asesor_nombre, e.apellido AS asesor_apellido,
      p.nombre AS plan_nombre
    FROM cotizaciones c
    JOIN empleados e ON c.asesor_id = e.legajo
    JOIN planes p ON c.plan_id = p.id
    JOIN clientes cl ON c.cliente_id = cl.id
    WHERE cl.dni = ? AND c.activo = 1
    ORDER BY c.fecha_creacion DESC
    LIMIT 1
  `;
  const [rows] = await pool.query(query, [dni]);
  return rows[0];
};

/**
 * Busca una cotización completa por su ID.
 * @param {number} id - El ID de la cotización a buscar.
 * @returns {Promise<object|undefined>} La cotización completa si se encuentra, de lo contrario undefined.
 */
const findCotizacionById = async (id) => {
  // Obtener la cotización principal
  const [cotizacionRows] = await pool.query('SELECT * FROM cotizaciones WHERE id = ?', [id]);
  if (!cotizacionRows[0]) return undefined; // No se encontró
  const cotizacion = cotizacionRows[0];

  // Obtener los datos relacionados
  const [clienteRows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [cotizacion.cliente_id]);
  const [miembrosRows] = await pool.query(`SELECT * FROM miembros_cotizacion WHERE cotizacion_id = ? ORDER BY FIELD(parentesco, 'Titular', 'Conyuge', 'Hijo')`, [id]);
  const [asesorRows] = await pool.query('SELECT legajo, nombre, apellido, email, telefono FROM empleados WHERE legajo = ?', [cotizacion.asesor_id]);
  const [planRows] = await pool.query('SELECT * FROM planes WHERE id = ?', [cotizacion.plan_id]);

  // Combinar todo
  return {
    ...cotizacion,
    cliente: clienteRows[0] || null,
    miembros: miembrosRows || [],
    plan: planRows[0] || null,
    asesor: {
      legajo: asesorRows[0]?.legajo,
      nombre: asesorRows[0]?.nombre,
      apellido: asesorRows[0]?.apellido,
      email: asesorRows[0]?.email,
      telefono: asesorRows[0]?.telefono,
    }
  };
};

/**
 * Busca todas las cotizaciones de un asesor (solo activos).
 * @param {string|number} asesorId - El ID del asesor.
 * @returns {Promise<Array<object>>} Un array con las cotizaciones encontradas.
 */
const findCotizacionesByAsesor = async (asesorId) => {
  const query = `
    SELECT 
      c.id, c.fecha_creacion, c.valor_total, c.estado, c.activo,
      cl.nombres AS cliente_nombre, cl.apellidos AS cliente_apellido,
      p.nombre AS plan_nombre
    FROM cotizaciones c
    JOIN clientes cl ON c.cliente_id = cl.id
    JOIN planes p ON c.plan_id = p.id
    WHERE c.asesor_id = ? AND c.activo = 1
    ORDER BY c.fecha_creacion DESC
  `;
  const [rows] = await pool.query(query, [asesorId]);
  return rows;
};

/**
 * Anula (borrado lógico) una cotización.
 * @param {number} id - El ID de la cotización a anular.
 * @returns {Promise<object>} Resultado de la operación de actualización.
 */
const anularCotizacion = async (id) => {
  // Actualizamos 'activo' y 'estado' para coherencia
  const query = "UPDATE cotizaciones SET activo = 0, estado = 'cancelado' WHERE id = ?";
  const [result] = await pool.query(query, [id]);
  return result;
};

/**
 * Busca una cotización ACTIVA por cliente, asesor, plan y cantidad de miembros.
 * Se usa para prevenir duplicados exactos.
 * @param {number} cliente_id - El ID del cliente.
 * @param {string|number} asesor_id - El ID del asesor.
 * @param {number} plan_id - El ID del plan.
 * @param {number} member_count - La cantidad de miembros en la cotización.
 * @returns {Promise<object|undefined>} La cotización si se encuentra, de lo contrario undefined.
 */
const findActiveCotizacionByPlanAndMemberCount = async (cliente_id, asesor_id, plan_id, member_count) => {
  const query = `
SELECT c.id
 FROM cotizaciones c
 -- Hacemos un subquery para contar los miembros de cada cotización
  JOIN (
  SELECT cotizacion_id, COUNT(*) AS conteo
  FROM miembros_cotizacion
  GROUP BY cotizacion_id ) mc
  ON c.id = mc.cotizacion_id
  WHERE c.cliente_id = ? 
  AND c.asesor_id = ? 
  AND c.plan_id = ? 
  AND c.activo = 1
  AND mc.conteo = ? -- Validamos también el conteo de miembros
  LIMIT 1
 `;
  const [rows] = await pool.query(query, [cliente_id, asesor_id, plan_id, member_count]);
  return rows[0];
};

module.exports = {
  createFullCotizacion,
  updateFullCotizacion,
  findLastCotizationByDni,
  findCotizacionById,
  findCotizacionesByAsesor,
  anularCotizacion,
  findActiveCotizacionByPlanAndMemberCount
};