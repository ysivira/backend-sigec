//====================================================
// IMPORTO DEPENDENCIAS Y BASE DE DATOS
//====================================================
const express = require('express');
require('./config/db');
const employeesRoutes = require('./routes/employeeRoutes');
const planRoutes = require('./routes/planRoutes');
const priceListRoutes = require('./routes/priceListRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');


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
// RUTAS 
//====================================================
app.use('/api/employees', employeesRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/priceList', priceListRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);

//====================================================
// MANEJO DE ERRORES 
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