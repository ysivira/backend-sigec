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

// =======================================================
// REGLAS PARA EMPLEADOS
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

// =======================================================
// REGLAS PARA CLIENTES  (POST /api/clientes)
// =======================================================

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

// =======================================================
// REGLAS PARA PLANES
// =======================================================
// Reglas para CREAR UN PLAN (POST /api/plans)

const validatePlanCreation = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.'),

  body('detalles')
    .optional() // Permitimos que 'detalles' esté vacío
    .isString().withMessage('Los detalles deben ser texto.'),

  body('condiciones_generales')
    .optional() // Permitimos que 'condiciones_generales' esté vacío
    .isString().withMessage('Las condiciones deben ser texto.')
];

// Reglas para ACTUALIZAR UN PLAN (PUT /api/plans/:id)

const validatePlanUpdate = [
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.'),

  body('detalles')
    .optional()
    .isString().withMessage('Los detalles deben ser texto.'),

  body('condiciones_generales')
    .optional()
    .isString().withMessage('Las condiciones deben ser texto.'),

  body('activo')
    .optional()
    .isBoolean().withMessage("El campo 'activo' debe ser un booleano (true o false).")
];

// =======================================================
// REGLAS PARA LISTAS DE PRECIOS
// =======================================================

// Reglas para ACTUALIZAR UN PRECIO (PUT /api/priceList/:id)
const validatePriceUpdate = [
  body('rango_etario')
    .optional()
    .isString().withMessage('El rango_etario debe ser texto.')
    .notEmpty().withMessage('El rango_etario no puede estar vacío.'),

  body('precio')
    .optional()
    .isDecimal({ decimal_digits: '2' }).withMessage('El precio debe ser un número con hasta 2 decimales.')
    .toFloat() // Convierte el string a número
];

// Reglas para AUMENTO MASIVO (POST /api/priceList/increase)
const validatePriceIncrease = [
  body('porcentaje')
    .notEmpty().withMessage('El porcentaje es requerido.')
    .isFloat({ gt: 0 }).withMessage('El porcentaje debe ser un número mayor a 0.')
    .toFloat(), // Convierte a número

  body('tipo_ingreso')
    .notEmpty().withMessage('El tipo_ingreso es requerido.')
    .isIn(['Obligatorio', 'Voluntario', 'Ambas'])
    .withMessage("El tipo_ingreso debe ser 'Obligatorio', 'Voluntario' o 'Ambas'.")
];

// =======================================================
// REGLAS PARA COTIZACIONES
// =======================================================
const {
  TIPOS_INGRESO,
  PARENTESCOS,
  DESCUENTOS_COMERCIALES,
  DESCUENTOS_AFINIDAD,
  CATEGORIAS_MONOTRIBUTO
} = require('../utils/constants');

// --- Reglas para CREAR/ACTUALIZAR COTIZACION ---
const validateCotizacion = [
  // Valida los 3 objetos principales
  body('clienteData')
    .isObject().withMessage('clienteData debe ser un objeto.'),
  body('cotizacionData')
    .isObject().withMessage('cotizacionData debe ser un objeto.'),
  body('miembrosData')
    .isArray({ min: 1 }).withMessage('Debe haber al menos un miembro en la cotización.'),

  // Valida clienteData (solo formato, no obligatoriedad)
  body('clienteData.dni')
    .notEmpty().withMessage('El DNI del cliente es requerido.')
    .isNumeric().withMessage('El DNI debe ser numérico.'),
  body('clienteData.nombres')
    .optional().isString().matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras.'),
  body('clienteData.apellidos')
    .optional().isString().matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo debe contener letras.'),
  body('clienteData.email')
    .optional().isEmail().withMessage('El email del cliente no es válido.'),
  body('clienteData.telefono')
    .optional().isNumeric().withMessage('El teléfono del cliente debe ser numérico.'),

  // Valida cotizacionData
  body('cotizacionData.plan_id')
    .notEmpty().withMessage('cotizacionData.plan_id es requerido.')
    .isInt({ min: 1 }).withMessage('El plan_id debe ser un número entero positivo.'),

  body('cotizacionData.tipo_ingreso')
    .notEmpty().withMessage('cotizacionData.tipo_ingreso es requerido.')
    .isIn(Object.values(TIPOS_INGRESO))
    .withMessage(`tipo_ingreso debe ser uno de: ${Object.values(TIPOS_INGRESO).join(', ')}`),

  body('cotizacionData.es_casado')
    .exists().withMessage('cotizacionData.es_casado es requerido (true o false).')
    .isBoolean().withMessage('es_casado debe ser un valor booleano.'),

  body('cotizacionData.descuento_comercial_pct')
    .notEmpty().withMessage('cotizacionData.descuento_comercial_pct es requerido.')
    .isNumeric().isIn(DESCUENTOS_COMERCIALES)
    .withMessage(`descuento_comercial_pct debe ser uno de: ${DESCUENTOS_COMERCIALES.join(', ')}`),

  body('cotizacionData.descuento_afinidad_pct')
    .notEmpty().withMessage('cotizacionData.descuento_afinidad_pct es requerido.')
    .isNumeric().isIn(DESCUENTOS_AFINIDAD)
    .withMessage(`descuento_afinidad_pct debe ser uno de: ${DESCUENTOS_AFINIDAD.join(', ')}`),

  // Valida campos condicionales
  body('cotizacionData.aporte_obra_social')
    .custom((value, { req }) => {
      if (req.body.cotizacionData.tipo_ingreso === 'Obligatorio' && (!value || parseFloat(value) <= 0)) {
        throw new Error('aporte_obra_social es requerido y debe ser mayor a 0 para tipo Obligatorio.');
      }
      return true;
    }),

  body('cotizacionData.monotributo_categoria')
    .custom((value, { req }) => {
      if (req.body.cotizacionData.tipo_ingreso === 'Monotributo' && !value) {
        throw new Error('monotributo_categoria es requerida para tipo Monotributo.');
      }
      if (value && !CATEGORIAS_MONOTRIBUTO.includes(value)) {
        throw new Error(`monotributo_categoria debe ser una de: ${CATEGORIAS_MONOTRIBUTO.join(', ')}`);
      }
      return true;
    }),

  // Valida Miembros
  body('miembrosData.*.parentesco')
    .notEmpty().withMessage('El parentesco es requerido para todos los miembros.')
    .isIn(Object.values(PARENTESCOS))
    .withMessage(`El parentesco debe ser uno de: ${Object.values(PARENTESCOS).join(', ')}`),

  body('miembrosData.*.edad')
    .notEmpty().withMessage('La edad es requerida para todos los miembros.')
    .isInt({ min: 0, max: 100 }).withMessage('La edad debe ser un número entre 0 y 100.')
];

module.exports = {
  checkValidation,
  validateEmployeeRegistration,
  validateEmployeeLogin,
  validateEmployeeUpdate,
  validateClientCreation,
  validateClientUpdate,
  validatePlanCreation,
  validatePlanUpdate,
  validatePriceUpdate,
  validatePriceIncrease,
  validateCotizacion
};