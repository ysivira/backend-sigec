//============================================================================
// MODELO DE CLIENTE
//============================================================================= 
const db = require('../config/db');

const Cliente = {
  // Funcion Buscar un cliente por DNI
  findByDni: (dni) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clientes WHERE dni = ? AND activo = 1';

      db.query(query, [dni], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  },

  // Crear un nuevo cliente 
  create: (clienteData) => {
    return new Promise((resolve, reject) => {
      const {
        dni,
        nombres,
        apellidos,
        email,
        telefono,
        asesor_captador_id,
      } = clienteData;

      const query = `
        INSERT INTO clientes 
        (dni, nombres, apellidos, email, telefono, asesor_captador_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(query, [dni, nombres, apellidos, email, telefono, asesor_captador_id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  // Buscar clientes por asesor captador
  findClientesByAsesor: (asesorId) => {
    return new Promise((resolve, reject) => {
      // Trae todos los clientes captados por este asesor que estén activos
      const query = `
        SELECT id, dni, nombres, apellidos, email, telefono 
        FROM clientes 
        WHERE asesor_captador_id = ? AND activo = 1
        ORDER BY apellidos, nombres
      `;
      db.query(query, [asesorId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Actualizar datos de un cliente
  update: (id, clienteData) => {
    return new Promise((resolve, reject) => {
      // Campos que permitimos modificar
      const { nombres, apellidos, email, telefono, direccion, codigo_postal, ciudad, provincia } = clienteData;

      const query = `
        UPDATE clientes SET 
          nombres = ?, apellidos = ?, email = ?, telefono = ?, 
          direccion = ?, codigo_postal = ?, ciudad = ?, provincia = ?
        WHERE id = ?
      `;

      db.query(query, [
        nombres, apellidos, email, telefono,
        direccion, codigo_postal, ciudad, provincia,
        id
      ], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  // Buscar cliente por ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clientes WHERE id = ? AND activo = 1';
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },


};

module.exports = Cliente;