//====================================================
// ENTRY POINT DE LA APLICACIÓN
//====================================================
/**
 * @file index.js
 * @description Punto de entrada principal del servidor de la API de SIGEC.
 * @requires express
 * @requires ./config/db
 * @requires ./routes/employeeRoutes
 * @requires ./routes/planRoutes
 * @requires ./routes/priceListRoutes
 * @requires ./routes/clienteRoutes
 * @requires ./routes/cotizacionRoutes
 * @requires express-rate-limit
 * @requires ./middleware/errorMiddleware
 * @requires swagger-ui-express
 * @requires ./config/swaggerConfig
 */

const express = require('express');
require('./config/db');
const employeesRoutes = require('./routes/employeeRoutes');
const planRoutes = require('./routes/planRoutes');
const priceListRoutes = require('./routes/priceListRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');

//====================================================
// INSTANCIA DE EXPRESS
//====================================================
const app = express();

//====================================================
// MIDDLEWARES
//====================================================
app.use(express.json());

// =======================================================
// SEGURIDAD: LÍMITE GLOBAL (Defensa DoS)
// =======================================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite: 100 peticiones por IP cada 15 minutos
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos',
  standardHeaders: true, 
  legacyHeaders: false,
});

// =======================================================
// Aplico el limitador a TODAS las rutas que empiecen con /api
// =======================================================
app.use('/api', globalLimiter);

//====================================================
// PUERTO PARA EL SERVIDOR USANDO UNA VARIABLE DE ENTORNO O EL PUERTO 5000 POR DEFECTO
//====================================================
const PORT = process.env.PORT || 5000;

//====================================================
// RUTA DE PRUEBA PARA VERIFICAR QUE EL SERVIDOR ESTA CORRIENDO
//====================================================
app.get('/', (req, res) => {
    res.json({ message: '¡API de SIGEC en funcionamiento!'});
});

//====================================================
// RUTA PARA LA DOCUMENTACIÓN DE SWAGGER
//====================================================
/**
 * @description Sirve la documentación de la API generada por Swagger.
 * @name /api/docs
 * @function
 * @memberof module:index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//====================================================
// RUTAS 
//====================================================
/**
 * @description Rutas para la gestión de empleados y autenticación.
 * @name /api/employees
 * @function
 * @memberof module:index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.use('/api/employees', employeesRoutes);

/**
 * @description Rutas para la gestión de planes.
 * @name /api/plans
 * @function
 * @memberof module:index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.use('/api/plans', planRoutes);

/**
 * @description Rutas para la gestión de listas de precios.
 * @name /api/priceList
 * @function
 * @memberof module:index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.use('/api/priceLists', priceListRoutes);

/**
 * @description Rutas para la gestión de clientes.
 * @name /api/clientes
 * @function
 * @memberof module:index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.use('/api/clientes', clienteRoutes);

/**
 * @description Rutas para la gestión de cotizaciones.
 * @name /api/cotizaciones
 * @function
 * @memberof module:index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.use('/api/cotizaciones', cotizacionRoutes);

//====================================================
// MANEJO DE ERRORES (El "Atrapa-todo")
//====================================================
// Middleware 404 (si la ruta no existe)
app.use(notFound);

// Middleware 500 (si algo falla en las rutas)
app.use(errorHandler);

//====================================================
// ESCUCHA EN EL PUERTO DEFINIDO
//====================================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo con Exito en:  http://localhost:${PORT}`);
});