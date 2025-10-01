//============================================================================
// EMPLOYEE ROUTES
//============================================================================= 
const express = require('express');
const router = express.Router();
const { registerEmployee, loginEmployee, getMyProfile } = require('../controllers/employeeController.js');
const { protect } = require('../middleware/AuthMiddleware.js');

//Ruta para registrar un nuevo empleado
router.post('/register', registerEmployee); 

//Ruta para el inicio de sesion del empleado
router.post('/login', loginEmployee);

//Middleware de proteccion para rutas que requieren autenticacion
router.get('/myprofile', protect, getMyProfile);


module.exports = router;