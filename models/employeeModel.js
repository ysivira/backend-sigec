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
  },

  // Obtener todos los empleados aceptando filtro de estado
  findAll: (estado = null) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT legajo, nombre, apellido, email, rol, estado, supervisor_id FROM empleados';
      const params = [];

      // Si se proporciona un estado, filtrar por ese estado
      if (estado) {
        query += ' WHERE estado = ?';
        params.push(estado);
      }

      //incluimos que el orden por defecto sea por apellido ascendente
      query += ' ORDER BY apellido ASC';

      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });   
    });
  },

  //Actualizar los detalles de un empleado (estado, rol y supervisor_id)
  updateDetails: (legajo, data) => {
    return new Promise((resolve, rehect) => {
      let fields = [];
      let values = [];

      //actualizar solo los campos que se proporcionan
      if (data.estado) {
        fields.push('estado = ?');
        values.push(data.estado);
      }
      if (data.rol) {
        fields.push('rol = ?');
        values.push(data.rol);
      }
      if (data.supervisor_id !== undefined) {
        // Permite asignar NULL en caso de pasar a los cargos Admin/Supervisor
        fields.push('supervisor_id = ?');
        values.push(data.supervisor_id);
      }
      if (data.email_confirmado !== undefined) {
        fields.push('email_confirmado = ?');
        values.push(data.email_confirmado);
      }
      if (fields.length === 0) {
        return resolve({affectedRows: 0, message: 'No hay campos para actualizar.'}); // Nada que actualizar
      }
      let query = `UPDATE empleados SET ${fields.join(', ')} WHERE legajo = ?`;
      values.push(legajo);

      db.query(query, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },  

  //Cambiar el estado de confirmacion de email (usado en el link de confirmación)
  confirmEmail: (legajo) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE empleados SET email_confirmado = 1 WHERE legajo = ? AND email_confirmado = 0';
      db.query(query, [legajo], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

};



module.exports = Employee;