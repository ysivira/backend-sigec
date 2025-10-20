//============================================================================
// MODELO DE CLIENTE
//============================================================================= 
const db = require('../config/db');

const Cliente = {
  // Funcion Buscar un cliente por DNI
  findByDni: (dni) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clientes WHERE dni = ? AND activo = 1';
      /////////DEPURACION///////////
      console.log('DEBUG: Buscando cliente con DNI:', dni); 
      console.log('DEBUG: Query:', query); 
      //////////////////////////////
      db.query(query, [dni], (err, results) => {
        if (err) {
          console.error('ERROR en Cliente.findByDni:', err); //DEPURACION
          return reject(err);
        }
        console.log('DEBUG: Resultados de la consulta:', results); //DEPURACION  
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
      } = clienteData;

      const query = `
        INSERT INTO clientes 
        (dni, nombres, apellidos, email, telefono) 
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(query, [dni, nombres, apellidos, email, telefono], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

};

module.exports = Cliente;