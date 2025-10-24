// =======================================================
// VALIDACIONES
// =======================================================
const { body, validationResult } = require('express-validator');
const { ROLES, ESTADOS_EMPLEADO } = require('../utils/constants');

// =======================================================
// REVISADOR GENERAL DE REGLAS
// =======================================================
// Este middleware es el que revisa si alguna de las reglas definidas falla
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  // Si hay errores, los detiene ANTES de llegar al controlador
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Si no hay errores, ¡sigue hacia el controlador!
  next();
};


// =======================================================
// PAQUETES DE REGLAS
// =======================================================
// Reglas para REGISTRAR UN EMPLEADO (POST /api/employees/register)
const validateEmployeeRegistration = [
  body('legajo')
    .notEmpty().withMessage('El legajo es requerido.')
    .isNumeric().withMessage('El legajo solo debe contener números.')
    .isLength({ min: 4, max: 8 }).withMessage('El legajo debe tener entre 4 y 8 dígitos.'),

  body('nombre')
    .notEmpty().withMessage('El nombre es requerido.')
    .isString().withMessage('El nombre debe ser texto.')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras y espacios.'),

  body('apellido')
    .notEmpty().withMessage('El apellido es requerido.')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo debe contener letras y espacios.'),

  body('email')
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().normalizeEmail().withMessage('El formato del email no es válido.'),

  body('telefono')
    .notEmpty().withMessage('El teléfono es requerido.')
    .isNumeric().withMessage('El teléfono solo debe contener números.')
    .isLength({ min: 10, max: 15 }).withMessage('El teléfono debe tener un formato válido (solo números, ej: 5411... ó 11...).'),

  body('direccion')
    .notEmpty().withMessage('La dirección es requerida.'),

  body('password')
    .notEmpty().withMessage('El password es requerido.')
    .isLength({ min: 6 }).withMessage('El password debe tener al menos 6 caracteres.')
];

// Reglas para LOGIN DE EMPLEADO (POST /api/employees/login)
const validateEmployeeLogin = [
  body('legajo').notEmpty().withMessage('El legajo es requerido.'),
  body('password').notEmpty().withMessage('El password es requerido.')
];

// Reglas para ACTUALIZAR EMPLEADO (PUT /api/employees/:legajo)
const validateEmployeeUpdate = [
  body('estado')
    .optional()
    .isIn(Object.values(ESTADOS_EMPLEADO))
    .withMessage(`El estado debe ser uno de: ${Object.values(ESTADOS_EMPLEADO).join(', ')}`),
  
  body('rol')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`El rol debe ser uno de: ${Object.values(ROLES).join(', ')}`),

  body('supervisor_id')
    .optional()
    .isNumeric().withMessage('El supervisor_id debe ser numérico.')
];

// Reglas para CREAR UN CLIENTE (POST /api/clientes)
const validateClientCreation = [
  body('dni')
    .notEmpty().withMessage('El DNI es requerido.')
    .isNumeric().withMessage('El DNI solo debe contener números.')
    .isLength({ min: 7, max: 8 }).withMessage('El DNI debe tener 7 u 8 dígitos.'),

  body('nombres')
    .notEmpty().withMessage('El/los nombre(s) son requeridos.')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras y espacios.'),

  body('apellidos')
    .notEmpty().withMessage('El/los apellido(s) son requeridos.')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo debe contener letras y espacios.'),

  body('email')
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().normalizeEmail().withMessage('El formato del email no es válido.'),

  body('telefono')
    .notEmpty().withMessage('El teléfono es requerido.')
    .isNumeric().withMessage('El teléfono solo debe contener números.')
];

// Reglas para ACTUALIZAR UN CLIENTE (PUT /api/clientes/:id)
const validateClientUpdate = [
  // .optional() = si no viene, no hay error. Si viene, se valida.
  body('email')
    .optional()
    .isEmail().normalizeEmail().withMessage('El formato del email no es válido.'),

  body('telefono')
    .optional()
    .isNumeric().withMessage('El teléfono solo debe contener números.')
];

module.exports = {
  checkValidation,
  validateEmployeeRegistration,
  validateEmployeeLogin,
  validateEmployeeUpdate,
  validateClientCreation,
  validateClientUpdate


};