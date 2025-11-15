// =======================================================
// VALIDACIONES
// =======================================================
/**
 * @file validationMiddleware.js
 * @description Middlewares de validación para las rutas de la API.
 * @requires express-validator
 * @requires ../utils/constants
 */

const { body, validationResult } = require('express-validator');
const {
  ROLES,
  ESTADOS_EMPLEADO,
  TIPOS_INGRESO,
  PARENTESCOS,
  DESCUENTOS_COMERCIALES,
  DESCUENTOS_AFINIDAD,
  CATEGORIAS_MONOTRIBUTO,
  OTROS_DESCUENTOS_OPCIONES
} = require('../utils/constants');

// =======================================================
// REVISADOR GENERAL DE REGLAS
// =======================================================
/**
 * Middleware que revisa si alguna de las reglas de validación de express-validator ha fallado.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
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
// PAQUETES DE REGLAS GENERALES
// =======================================================

/**
 * @description Reglas de validación para el registro de un empleado.
 * @type {Array<import('express-validator').ValidationChain>}
 */
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

/**
 * @description Reglas de validación para el login de un empleado.
 * @type {Array<import('express-validator').ValidationChain>}
 */
const validateEmployeeLogin = [
  body('legajo').notEmpty().withMessage('El legajo es requerido.'),
  body('password').notEmpty().withMessage('El password es requerido.')
];

/**
 * @description Reglas de validación para la actualización de un empleado.
 * @type {Array<import('express-validator').ValidationChain>}
 */
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
    .optional({nullable: true})
    .isNumeric().withMessage('El supervisor_id debe ser numérico.')
];

/**
 * @description Reglas de validación para la creación de un cliente.
 * @type {Array<import('express-validator').ValidationChain>}
 */
const validateClientCreation = [
  body('dni')
    .trim()
    .notEmpty().withMessage('El DNI es requerido.')
    .isNumeric().withMessage('El DNI solo debe contener números.')
    .isLength({ min: 7, max: 8 }).withMessage('El DNI debe tener 7 u 8 dígitos.'),

  body('nombres') 
    .trim()
    .notEmpty().withMessage('El/los nombre(s) es/son requeridos.')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras y espacios.'),

  body('apellidos')
    .trim()
    .notEmpty().withMessage('El/los apellido(s) es/son requeridos.')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo debe contener letras y espacios.'),

  body('email')
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().normalizeEmail().withMessage('El formato del email no es válido.'),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido.')
    .isNumeric().withMessage('El teléfono solo debe contener números.'),
  
  body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es requerida.'),
];

/**
 * @description Reglas de validación para la actualización de un cliente.
 * @type {Array<import('express-validator').ValidationChain>}
 */
const validateClientUpdate = [
  body('email')
    .optional()
    .isEmail().normalizeEmail().withMessage('El formato del email no es válido.'),

  body('telefono')
    .optional()
    .isNumeric().withMessage('El teléfono solo debe contener números.')
];

/**
 * @description Reglas de validación para la creación de un plan.
 * @type {Array<import('express-validator').ValidationChain>}
 */
const validatePlanCreation = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.'),

  body('detalles')
    .optional()
    .isString().withMessage('Los detalles deben ser texto.'),

  body('condiciones_generales')
    .optional()
    .isString().withMessage('Las condiciones deben ser texto.')
];

/**
 * @description Reglas de validación para la actualización de un plan.
 * @type {Array<import('express-validator').ValidationChain>}
 */
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

/**
 * @description Reglas de validación para la actualización de un precio.
 * @type {Array<import('express-validator').ValidationChain>}
 */
const validatePriceUpdate = [
  body('edad_desde')
    .optional()
    .isInt({ min: 0 }).withMessage('edad_desde debe ser un número entero >= 0.'),
  
  body('edad_hasta')
    .optional()
    .isInt({ min: 0 }).withMessage('edad_hasta debe ser un número entero >= 0.')
    .custom((value, { req }) => {
      if ((value !== undefined && req.body.edad_desde === undefined) || 
          (value === undefined && req.body.edad_desde !== undefined)) {
        throw new Error('Para cambiar el rango, se deben enviar ambos: edad_desde y edad_hasta.');
      }
      return true;
    }),

  body('precio')
    .optional()
    .isDecimal({ decimal_digits: '2' }).withMessage('El precio debe ser un número con hasta 2 decimales.')
    .toFloat()
];

/**
 * @description Reglas de validación para el aumento masivo de precios.
 * @type {Array<import('express-validator').ValidationChain>}
 */
const validatePriceIncrease = [
  body('porcentaje')
    .notEmpty().withMessage('El porcentaje es requerido.')
    .isFloat({ gt: 0 }).withMessage('El porcentaje debe ser un número mayor a 0.')
    .toFloat(),

  body('tipo_ingreso')
    .notEmpty().withMessage('El tipo_ingreso es requerido.')
    .isIn(['Obligatorio', 'Voluntario', 'Ambas'])
    .withMessage("El tipo_ingreso debe ser 'Obligatorio', 'Voluntario' o 'Ambas'.")
];

/**
 * @description Reglas de validación para la creación y actualización de una cotización.
 * @type {Array<import('express-validator').ValidationChain>}
 */
const validateCotizacion = [
  body('clienteData')
    .isObject().withMessage('clienteData debe ser un objeto.'),
  
  body('cotizacionData')
    .isObject().withMessage('cotizacionData debe ser un objeto.'),

  body('miembrosData')
    .isArray({ min: 1 }).withMessage('Debe haber al menos un miembro en la cotización.'),

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
    .optional() 
    .isNumeric().withMessage('El descuento comercial debe ser numérico.')
    .toFloat() 
    .isIn(DESCUENTOS_COMERCIALES)
    .withMessage(`descuento_comercial_pct debe ser uno de: ${DESCUENTOS_COMERCIALES.join(', ')}`),

  body('cotizacionData.descuento_afinidad_pct')
    .optional() 
    .isNumeric().withMessage('El descuento de afinidad debe ser numérico.')
    .toFloat() 
    .isIn(DESCUENTOS_AFINIDAD)
    .withMessage(`descuento_afinidad_pct debe ser uno de: ${DESCUENTOS_AFINIDAD.join(', ')}`),

  body('cotizacionData.descuento_tarjeta_pct')
    .optional() 
    .isNumeric().withMessage('El descuento de tarjeta debe ser numérico.')
    .toFloat()
    .isIn([0, 5]) 
    .withMessage('descuento_tarjeta_pct debe ser 0 o 5.'),

  body('cotizacionData.descuento_otros_opcion')
    .optional({ checkFalsy: true })
    .isIn(OTROS_DESCUENTOS_OPCIONES)
    .withMessage(`Opción de Otros Descuentos inválida. Valores permitidos: ${OTROS_DESCUENTOS_OPCIONES.join(', ')}`), 

  body('cotizacionData.aporte_obra_social')
    .optional() 
    .isNumeric().withMessage('El aporte debe ser numérico.')
    .toFloat()
    .custom((value, { req }) => { 
      if (req.body.cotizacionData.tipo_ingreso === 'Obligatorio' && (!value || value <= 0)) {
        throw new Error('aporte_obra_social es requerido y debe ser mayor a 0 para tipo Obligatorio.');
      }
      return true;
    }),

  body('cotizacionData.monotributo_categoria')
    .optional() 
    .custom((value, { req }) => { 
      if (req.body.cotizacionData.tipo_ingreso === 'Monotributo' && !value) {
        throw new Error('monotributo_categoria es requerida para tipo Monotributo.');
      }
      if (value && !CATEGORIAS_MONOTRIBUTO.includes(value)) {
        throw new Error(`monotributo_categoria debe ser una de: ${CATEGORIAS_MONOTRIBUTO.join(', ')}`);
      }
      return true;
    }),

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