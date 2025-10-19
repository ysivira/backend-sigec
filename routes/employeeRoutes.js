//============================================================================
// EMPLOYEE ROUTES
//============================================================================= 
const express = require('express');
const router = express.Router();
const { registerEmployee, loginEmployee, getAllEmployees, updateEmployeeStatus, getMyProfile } = require('../controllers/employeeController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { isAdmin } = require('../middleware/adminMiddleware.js');

//Ruta para registrar un nuevo empleado
router.post('/register', registerEmployee); 

//Ruta para el inicio de sesion del empleado
router.post('/login', loginEmployee);

//Middleware de proteccion para rutas que requieren autenticacion
router.get('/myprofile', protect, getMyProfile);

//Rutas protegidas para administradores
//Lista todos los empleados
router.get('/', protect, isAdmin, getAllEmployees);
//Actualiza el estado de un empleado
router.put('/status/:legajo', protect, isAdmin, updateEmployeeStatus);

module.exports = router;