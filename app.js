//====================================================
// ARCHIVO PRINCIPAL
//====================================================
/**
 * @fileoverview Archivo principal de la aplicación Express.
 * Este archivo configura la aplicación, importa las rutas, establece los middlewares,
 * y define el manejo de errores. Es el punto de entrada para todas las solicitudes a la API.
 */

const express = require('express');
const cors = require('cors');
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

app.use(cors());
//====================================================
// MIDDLEWARES
//====================================================
app.use(express.json());


// =======================================================
// SEGURIDAD: LÍMITE GLOBAL (Defensa DoS)
// =======================================================
// Middleware para limitar la cantidad de peticiones por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite: 100 peticiones por IP cada 15 minutos
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos',
  standardHeaders: true, 
  legacyHeaders: false,
});

// Aplica el limitador a todas las rutas que empiecen con /api
app.use('/api', globalLimiter);

//====================================================
// RUTA DE PRUEBA
//====================================================
app.get('/', (req, res) => {
  res.json({ message: '¡API de SIGEC en funcionamiento!'});
});

//====================================================
// RUTA PARA LA DOCUMENTACIÓN DE SWAGGER
//====================================================
// Sirve la documentación de la API generada por Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//====================================================
// RUTAS DE LA API
//====================================================
// Define las rutas para los diferentes recursos de la API
app.use('/api/employees', employeesRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/priceLists', priceListRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);

//====================================================
// MANEJO DE ERRORES 
//====================================================
// Middlewares para manejar errores 404 y otros errores de la aplicación
app.use(notFound);
app.use(errorHandler);

module.exports = app;
