//====================================================
// IMPORTO DEPENDENCIAS Y BASE DE DATOS
//====================================================
const express = require('express');
require('./config/db');
const employeesRoutes = require('./routes/employeeRoutes');

//====================================================
// INSTANCIA DE EXPRESS
//====================================================
const app = express();

//====================================================
// MIDDLEWARES
//====================================================
app.use(express.json());

//====================================================
// PUERTO PARA EL SERVIDOR USANDO UNA VARIABLE DE ENTORNO O EL PUERTO 3000 POR DEFECTO
//====================================================
const PORT = process.env.PORT || 5000;

//====================================================
// RUTA DE PRUEBA PARA VERIFICAR QUE EL SERVIDOR ESTA CORRIENDO
//====================================================
app.get('/', (req, res) => {
    res.json({ message: '¡API de SIGEC en funcionamiento!'});
});

//====================================================
// RUTAS DE EMPLEADOS
//====================================================
app.use('/api/employees', employeesRoutes);

//====================================================
// ESCUCHA EN EL PUERTO DEFINIDO
//====================================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo con Exito en:  http://localhost:${PORT}`);
});