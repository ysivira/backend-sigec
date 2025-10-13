//============================================================================
// ADMIN MIDDLEWARE
//============================================================================= 

const isAdmin = (req, res, next) => {
  if (req.employee && req.employee.rol === 'administrador') {
    next(); // Si es admin, puede continuar
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
};

module.exports = { isAdmin };