//============================================================================
// CONFIGURACION DB SIGEC-TEST
//============================================================================
/**
 * @fileoverview Este archivo de configuración inicializa el entorno de prueba para Jest.
 * Carga las variables de entorno desde un archivo .env, establece el NODE_ENV a 'test',
 * y configura la base de datos de prueba y un secreto JWT si no está definido.
 */


const dotenv = require('dotenv');

// Carga las variables de entorno del archivo .env
dotenv.config(); 

// Establece el entorno de Node.js a 'test'
process.env.NODE_ENV = 'test'; 

// Configura el nombre de la base de datos para las pruebas
process.env.DB_DATABASE = 'sigec_test'; 

// Si no se ha definido un secreto para JWT, establece uno por defecto para las pruebas
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'secreto_de_prueba_para_jest';
}
