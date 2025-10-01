// models/employeeModel.js

const db = require('../config/db');

const Employee = {
  // Función para crear un nuevo empleado
  create: (employeeData) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO empleados 
        (legajo, nombre, segundo_nombre, apellido, segundo_apellido, email, telefono, direccion, password, rol, supervisor_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        employeeData.legajo,
        employeeData.nombre,
        employeeData.segundo_nombre,
        employeeData.apellido,
        employeeData.segundo_apellido,
        employeeData.email,
        employeeData.telefono,
        employeeData.direccion,
        employeeData.hashedPassword,
        employeeData.rol,
        employeeData.supervisor_id,
      ];

      db.query(query, values, (err, result) => {
        if (err) {
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