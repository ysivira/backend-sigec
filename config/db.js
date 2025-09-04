//====================================================
// ARCHIVO DE CONFIGURACION DE LA BASE DE DATOS
//====================================================

//=============================================================================
//IMPORTO DEPENDENCIAS Y VARIABLES DE ENTORNO .ENV
//=============================================================================
require('dotenv').config(); 
const mysql = require('mysql2');

//====================================================================
// CONEXION A LA DB USANDO LAS VARIABLES DE ENTORNO
//====================================================================
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

//==================================== 
// CONEXION A LA BASE DE DATOS MYSQL
//==================================== 
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ', err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL con el ID: ', connection.threadId);
});

//====================================================
// EXPORTO LA CONEXION PARA USARLA EN OTROS MODULOS
//====================================================
module.exports = connection;