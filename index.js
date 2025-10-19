//====================================================
// IMPORTO DEPENDENCIAS Y BASE DE DATOS
//====================================================
const express = require('express');
require('./config/db');
const employeesRoutes = require('./routes/employeeRoutes');
const planRoutes = require('./routes/planRoutes');
const priceListRoutes = require('./routes/priceListRoutes');


//====================================================
// INSTANCIA DE EXPRESS
//====================================================
const app = express();

//====================================================
// MIDDLEWARES
//====================================================
app.use(express.json());

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

//====================================================
// ESCUCHA EN EL PUERTO DEFINIDO
//====================================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo con Exito en:  http://localhost:${PORT}`);
});