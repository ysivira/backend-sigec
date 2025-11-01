//====================================================
// ARCHIVO DE CONFIGURACION DE LA BASE DE DATOS
//====================================================
/**
 * @file db.js
 * @description Configuración y creación del pool de conexiones a la base de datos MySQL.
 * @requires mysql2
 * @requires dotenv
 */

//=============================================================================
//IMPORTO DEPENDENCIAS Y VARIABLES DE ENTORNO .ENV
//=============================================================================
const mysql = require('mysql2');
require('dotenv').config(); 

//====================================================================
// CONEXION A LA DB USANDO LAS VARIABLES DE ENTORNO
//====================================================================
/**
 * @description Pool de conexiones a la base de datos MySQL.
 * @type {import('mysql2').Pool}
 */
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//==================================== 
// CONEXION A LA BASE DE DATOS MYSQL
//==================================== 
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar con el Pool de la base de datos:', err);
    return;
  }
  if (connection) {
    console.log(`Conexión exitosa al Pool de MySQL con el ID ${connection.threadId}`);
    // Libero la conexión de prueba
    connection.release(); 
  }
});

//====================================================
// EXPORTO LA CONEXION PARA USARLA EN OTROS MODULOS
//====================================================
/**
 * @description Pool de conexiones a la base de datos con soporte para promesas.
 * @type {import('mysql2/promise').Pool}
 */
module.exports = db.promise();