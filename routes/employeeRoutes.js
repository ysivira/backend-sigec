//============================================================================
// EMPLOYEE ROUTES
//============================================================================= 
const express = require('express');
const router = express.Router();
const { registerEmployee, loginEmployee, getAllEmployees, updateEmployeeDetails, getMyProfile, confirmEmployeeEmail } = require('../controllers/employeeController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { isAdmin } = require('../middleware/adminMiddleware.js');

//Ruta para registrar un nuevo empleado
router.post('/register', registerEmployee); 

//Ruta para confirmar el email del empleado
router.get('/confirm-email/:legajo', confirmEmployeeEmail);

//Ruta para el inicio de sesion del empleado
router.post('/login', loginEmployee);

//Middleware de proteccion para rutas que requieren autenticacion
router.get('/myprofile', protect, getMyProfile);

//Rutas protegidas para administradores
//Lista todos los empleados
router.get('/', protect, isAdmin, getAllEmployees);

//Actualiza los detalles/estado/rol de un empleado
router.put('/:legajo', protect, isAdmin, updateEmployeeDetails);

module.exports = router;