//============================================================================
// MANEJO DE ERRORES EN EXPRESS
// Description: Middleware para manejo de errores 
//============================================================================

// Middleware para rutas no encontradas (404)
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error); 
};

// Middleware para errores 500
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