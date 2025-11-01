//============================================================================
// MIDDLEWARE DE AUTENTICACION
//============================================================================= 
/**
 * @file authMiddleware.js
 * @description Middleware para proteger rutas mediante la validación de tokens JWT.
 * @requires jsonwebtoken
 * @requires ../models/employeeModel
 */

const jwt = require('jsonwebtoken');
const Employee = require('../models/employeeModel');

/**
 * Middleware para proteger rutas. Verifica el token JWT en el header de autorización.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtengo el token del header
            token = req.headers.authorization.split(' ')[1];
            // Verifico el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Obtengo el empleado asociado al token
            req.employee = await Employee.findByLegajo(decoded.id);
            next();
        } catch (error) {
            console.error('Error en la autenticacion del token:', error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }
    if(!token) {
        res.status(401).json({ message: 'No autorizado, sin token' });
    }
};

module.exports = { protect };