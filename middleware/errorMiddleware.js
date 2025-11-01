//============================================================================
// MANEJO DE ERRORES EN EXPRESS
//============================================================================
/**
 * @file errorMiddleware.js
 * @description Middlewares para el manejo de errores 404 y 500 en Express.
 */

/**
 * Middleware para manejar rutas no encontradas (404).
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error); 
};

/**
 * Middleware para manejar errores generales de la aplicación (500).
 * @param {Error} err - El objeto de error.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
const errorHandler = (err, req, res, next) => {
    // Lo cambiamos a 500 (Error de Servidor) si es necesario cuando el error se produce pero el status es 200
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  res.status(statusCode).json({
    message: message,
    // Por seguridad, solo mostramos el 'stack' (la traza del error) 
    // si no estamos en producción
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };