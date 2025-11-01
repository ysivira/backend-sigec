//============================================================================
// ADMIN MIDDLEWARE
//============================================================================= 
/**
 * @file adminMiddleware.js
 * @description Middleware para verificar si el usuario tiene rol de administrador.
 */

/**
 * Middleware para verificar si el usuario autenticado es un administrador.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
const isAdmin = (req, res, next) => {
  if (req.employee && req.employee.rol === 'administrador') {
    next(); // Si es admin, puede continuar
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
};

module.exports = { isAdmin };