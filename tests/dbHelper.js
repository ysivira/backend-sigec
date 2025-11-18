//============================================================================
// CONFIGURACION DE LA BASE DE DATOS DE PRUEBA SIGEC-TEST
//============================================================================

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Creamos un pool de conexión ESPECÍFICO para las pruebas, usará las variables de entorno que 'setup.js', se conectará a 'sigec_test'
const testPool = mysql.createPool({
  host: process.env.TEST_DB_HOST,
  user: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  database: process.env.TEST_DB_NAME,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true, 
});

/**
 * CONSTRUIR: Lee el 'schema.sql' y ejecutalo
 */
const setupTestDB = async () => {
  try {
    // Busca y leer el archivo schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Ejecutar el script SQL para crear todas las tablas
    await testPool.query(schemaSQL);
    
  } catch (error) {
    console.error('Error al construir la base de datos de prueba:', error);
    process.exit(1); // Detiene las pruebas si la DB falla
  }
};

/**
 * DEMOLER: Borra todas las tablas para dejar la DB limpia
 */
const teardownTestDB = async () => {
  try {
    // Obtiene los nombres de todas las tablas
    const [rows] = await testPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = ?`, 
      [process.env.DB_DATABASE]
    );

    if (rows.length === 0) {
      await testPool.end();
      return;
    }

    // Desactiva las llaves foráneas para poder borrar
    await testPool.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Crea un script 'DROP TABLE' para todas las tablas
    const dropQueries = rows.map(row => `DROP TABLE IF EXISTS \`${row.table_name}\`;`).join(' ');
    await testPool.query(dropQueries);

    // Reactiva las llaves foráneas
    await testPool.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Cierra la conexión de pruebas
    await testPool.end();

  } catch (error) {
    console.error('Error al demoler la base de datos de prueba:', error);
  }
};

module.exports = {
  testPool,
  setupTestDB,
  teardownTestDB,
};