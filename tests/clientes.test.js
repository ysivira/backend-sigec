//============================================================================
// TEST MODULO CLIENTES
//============================================================================
/**
 * @fileoverview Pruebas de integración para el módulo de clientes.
 * @requires supertest
 * @requires ../app
 * @requires ./dbHelper
 * @requires bcryptjs
 * @requires ../config/db
 */
const supertest = require('supertest');
const app = require('../app'); 
const { setupTestDB, teardownTestDB, testPool } = require('./dbHelper');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); 

const api = supertest(app);

beforeAll(async () => {
    await setupTestDB(); 
});

beforeEach(async () => {
    await testPool.query('SET FOREIGN_KEY_CHECKS = 0;');
    await testPool.query('TRUNCATE TABLE empleados;');
    await testPool.query('TRUNCATE TABLE clientes;');
    await testPool.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Asesor de Prueba (999999) necesario en CADA prueba para poder loguearnos
    const passwordPrueba = 'password_de_prueba_123';
    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(passwordPrueba, salt);

    await testPool.query(
        `INSERT INTO empleados (legajo, nombre, apellido, email, telefono, password, rol, estado, email_confirmado, direccion) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            '999999', 'Juan', 'Login', 'juan.login@sigec.com', '1122334455',
            passwordHasheada, 'asesor', 'activo', 1, 'Calle Falsa 123'
        ]
    );
});

// Se ejecuta UNA VEZ después de todas las pruebas
afterAll(async () => {
    await teardownTestDB(); 
    await db.end(); 
});

const loginAsesor = async () => {
    const response = await api.post('/api/employees/login')
        .send({
            legajo: '999999',
            password: 'password_de_prueba_123'
        });
    return response.body.token; };


/**
 * @describe Suite de pruebas para el módulo de clientes.
 */
describe('Módulo de Clientes (Rutas Protegidas)', () => {

    /**
     * @it Prueba para obtener la lista de clientes.
     */
    it('debería obtener la lista de clientes si se provee un token válido', async () => {

        const token = await loginAsesor();

        const response = await api.get('/api/clientes')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); 
    });


    /**
     * @it Prueba para crear un nuevo cliente.
     */
    it('debería crear un nuevo cliente si se provee un token válido', async () => {

        const token = await loginAsesor();

        const nuevoCliente = {
            nombres: 'Cliente de Prueba', 
            apellidos: 'Supertest', 
            dni: '12345678',
            email: 'cliente.prueba@email.com',
            telefono: '1199887766',
            fecha_nacimiento: '1990-01-01',
            direccion: 'Avenida Siempre Viva 742'
        };

        const response = await api.post('/api/clientes')
            .set('Authorization', `Bearer ${token}`) 
            .send(nuevoCliente); 
        
        expect(response.status).toBe(201); 
        expect(response.body).toHaveProperty('message', 'Cliente creado exitosamente');

        const [rows] = await testPool.query(
            'SELECT * FROM clientes WHERE dni = ?',
            [nuevoCliente.dni]
        );
        expect(rows.length).toBe(1);
        expect(rows[0].nombres).toBe('Cliente de Prueba');
    });

});