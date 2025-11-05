//============================================================================
// PUNTO DE ENTRADA DE LA APP
//============================================================================
/**
 * @fileoverview Punto de entrada de la aplicación.
 * Este archivo importa la aplicación Express desde `app.js` y la inicia,
 * haciendo que el servidor escuche en el puerto especificado.
 */

// Importa la instancia de la aplicación Express desde app.js
const app = require('./app');

// Obtiene el puerto de las variables de entorno o usa 5000 por defecto
const PORT = process.env.PORT || 5000;

//====================================================
// ESCUCHA EN EL PUERTO DEFINIDO
//====================================================
app.listen(PORT, () => {
  console.log(`Servidor corriendo con Éxito en: http://localhost:${PORT}`);
});
