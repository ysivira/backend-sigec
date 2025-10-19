//============================================================================
// MODELO DE EMPLEADO
//============================================================================= 

const db = require('../config/db');

const Employee = {
  // Función para crear un nuevo empleado
  create: (employeeData) => {
    return new Promise((resolve, reject) => {
      const {
        legajo, nombre, segundo_nombre, apellido, segundo_apellido,
        email, telefono, direccion, hashedPassword,
      } = employeeData;

      const query = `
        INSERT INTO empleados 
        (legajo, nombre, segundo_nombre, apellido, segundo_apellido, 
         email, telefono, direccion, password, 
         rol, estado, supervisor_id, fecha_creacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'asesor', 'inactivo', NULL, NOW())
      `;

      const values = [
        legajo, 
        nombre, 
        segundo_nombre, 
        apellido, 
        segundo_apellido,
        email, 
        telefono, 
        direccion, 
        hashedPassword,
      ];

      db.query(query, values, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return reject(new Error('El legajo o email ya existe.'));
          }
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  //Funcion para buscar un empleado por su legajo
  findByLegajo: (legajo) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM empleados WHERE legajo = ?';
      db.query(query, [legajo], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }
};

module.exports = Employee;