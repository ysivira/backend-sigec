//============================================================================
// UTILIDAD PARA GENERAR TOKENS JWT
//============================================================================= 
/**
 * @file generateToken.js
 * @description Utilidad para generar tokens JWT.
 * @requires jsonwebtoken
 */

const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT para un usuario.
 * @param {string|number} id - El ID del usuario (legajo del empleado).
 * @param {string} rol - El rol del usuario.
 * @returns {string} El token JWT generado.
 */
const generateToken = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
        expiresIn: '1h', 
    });
};

module.exports = generateToken;