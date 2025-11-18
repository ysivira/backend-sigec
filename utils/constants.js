//============================================================================
// CONSTANTES DEL SISTEMA SIGEC
//============================================================================= 
/**
 * @file constants.js
 * @description Constantes utilizadas en la aplicación SIGEC.
 */

/**
 * @description Roles de los empleados en el sistema.
 * @type {{ADMINISTRADOR: string, SUPERVISOR: string, ASESOR: string}}
 */
const ROLES = {
  ADMINISTRADOR: 'administrador',
  SUPERVISOR: 'supervisor',
  ASESOR: 'asesor',
};

/**
 * @description Tipos de listas de precios.
 * @type {{OBLIGATORIA: string, VOLUNTARIA: string}}
 */
const TIPOS_LISTA = {
  OBLIGATORIA: 'Obligatoria',
  VOLUNTARIA: 'Voluntaria',
};

/**
 * @description Estados de los empleados en el sistema.
 * @type {{ACTIVO: string, INACTIVO: string}}
 */
const ESTADOS_EMPLEADO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
};

/**
 * @description Parentescos de los miembros de una cotización.
 * @type {{TITULAR: string, CONYUGE: string, HIJO: string}}
 */
const PARENTESCOS = {
  TITULAR: 'Titular',
  CONYUGE: 'Conyuge',
  HIJO: 'Hijo'
};

/**
 * @description Porcentajes de descuentos comerciales permitidos.
 * @type {number[]}
 */
const DESCUENTOS_COMERCIALES = [0, 20, 30, 45];

/**
 * @description Porcentajes de descuentos por afinidad permitidos.
 * @type {number[]}
 */
const DESCUENTOS_AFINIDAD = [0, 10, 20];

/**
 * @description Categorías de monotributo.
 * @type {string[]}
 */
const CATEGORIAS_MONOTRIBUTO = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

/**
 * @description Tipos de ingreso para las cotizaciones.
 * @type {{OBLIGATORIO: string, VOLUNTARIO: string, MONOTRIBUTO: string}}
 */
const TIPOS_INGRESO = {
  OBLIGATORIO: 'Obligatorio',
  VOLUNTARIO: 'Voluntario',
  MONOTRIBUTO: 'Monotributo'
};

const RANGOS_ETARIOS = [
  // Titulares
  '0-25',
  '26-35',
  '36-40',
  '41-50',
  '51-60',
  '61-65',
  '66-00',
  
  // Matrimonios
  'MAT 0-25',
  'MAT 26-35',
  'MAT 36-40',
  'MAT 41-50',
  'MAT 51-60',
  'MAT 61-65',
  'MAT 66-00', 
  
  // Hijos
  'HIJO 0-1',
  'HIJO 2-20',
  'HIJO 21-29',
  'HIJO 30-39',
  'HIJO 40-49',
  
  // Otros 
  'FAMILIAR A CARGO' 
];

/**
 * @description Opciones para otros descuentos.
 * @type {string[]}
 */
const OTROS_DESCUENTOS_OPCIONES = [
  'N/A',
  'Tarjeta de credito', // 5%
  'Joven'             // 30%
];

module.exports = {
  ROLES,
  TIPOS_LISTA,
  ESTADOS_EMPLEADO,
  PARENTESCOS,
  DESCUENTOS_COMERCIALES,
  DESCUENTOS_AFINIDAD,
  CATEGORIAS_MONOTRIBUTO,
  TIPOS_INGRESO,
  OTROS_DESCUENTOS_OPCIONES,
  RANGOS_ETARIOS
};