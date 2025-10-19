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
        if (err) return reject(err);
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
        empleado_id    // ID del asesor logueado
      } = clienteData;

      const query = `
        INSERT INTO clientes 
        (dni, nombres, apellidos, email, telefono, asesor_captador_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(query, [dni, nombres, apellidos, email, telefono, empleado_id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

};

module.exports = Cliente;