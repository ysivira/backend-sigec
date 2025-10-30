//============================================================================
// CONSTANTES DEL SISTEMA SIGEC
//============================================================================= 

const ROLES = {
  ADMINISTRADOR: 'administrador',
  SUPERVISOR: 'supervisor',
  ASESOR: 'asesor',
};

const TIPOS_LISTA = {
  OBLIGATORIA: 'Obligatoria',
  VOLUNTARIA: 'Voluntaria',
};

const ESTADOS_EMPLEADO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
};

const PARENTESCOS = {
  TITULAR: 'Titular',
  CONYUGE: 'Conyuge',
  HIJO: 'Hijo'
};

const DESCUENTOS_COMERCIALES = [0, 20, 30, 45];

const DESCUENTOS_AFINIDAD = [0, 10, 20];

const CATEGORIAS_MONOTRIBUTO = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

const TIPOS_INGRESO = {
  OBLIGATORIO: 'Obligatorio',
  VOLUNTARIO: 'Voluntario',
  MONOTRIBUTO: 'Monotributo'
};

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
  OTROS_DESCUENTOS_OPCIONES
};