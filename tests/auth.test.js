//============================================================================
// TEST MODULO DE AUTENTICACION
//============================================================================
/**
 * @fileoverview Pruebas de integración para el módulo de autenticación.
 * @requires supertest
 * @requires ../app
 * @requires ./dbHelper
 * @requires bcryptjs
 * @requires ../config/db
 * @requires ../service/emailService
 */

const supertest = require('supertest');
const app = require('../app'); 
const { setupTestDB, teardownTestDB, testPool } = require('./dbHelper');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); 
const emailService = require('../service/emailService'); 

jest.mock('../service/emailService', () => ({
  __esModule: true,
  sendActivationEmail: jest.fn().mockResolvedValue(true),
  sendResetPasswordEmail: jest.fn().mockResolvedValue(true), 
}));
const api = supertest(app);

beforeAll(async () => {
  await setupTestDB(); 
});

afterAll(async () => {
  await teardownTestDB(); 
  await db.end();
});

/**
 * @describe Suite de pruebas para el módulo de autenticación.
 */
describe('Módulo de Autenticación', () => {

  /**
   * @it Prueba de login exitoso.
   */
  it('debería loguear a un empleado válido y devolver un token', async () => {
    
    const legajoPrueba = '999999';
    const passwordPrueba = 'password_de_prueba_123';
    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(passwordPrueba, salt);

    await testPool.query(
      `INSERT INTO empleados (legajo, nombre, apellido, email, telefono, password, rol, estado, email_confirmado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [legajoPrueba, 'Juan', 'Test', 'juan.test@sigec.com', '11223344', passwordHasheada, 'asesor', 'activo', 1]
    );

    const response = await api.post('/api/employees/login')
      .send({
        legajo: legajoPrueba,
        password: passwordPrueba 
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  /**
   * @it Prueba de login con contraseña incorrecta.
   */
  it('debería devolver 401 si la contraseña es incorrecta', async () => {
    
    const legajoPrueba = '888888'; 
    const passwordReal = 'password_real_123';
    const passwordIncorrecta = 'password_falsa_456';

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(passwordReal, salt);

    await testPool.query(
      `INSERT INTO empleados (legajo, nombre, apellido, email, telefono, password, rol, estado, email_confirmado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [legajoPrueba, 'Maria', 'Test', 'maria.test@sigec.com', '55667788', passwordHasheada, 'supervisor', 'activo', 1]
    );

    const response = await api.post('/api/employees/login')
      .send({
        legajo: legajoPrueba,
        password: passwordIncorrecta 
      });

    expect(response.status).toBe(401); 
    expect(response.body).toHaveProperty('message'); 
    expect(response.body).not.toHaveProperty('token'); 
  });

  /**
   * @it Prueba de login con legajo inexistente.
   */
  it('debería devolver 401 o 404 si el legajo no existe', async () => {
    
    const response = await api.post('/api/employees/login')
      .send({
        legajo: '000000',
        password: 'password_falsa_123'
      });

    expect([401, 404]).toContain(response.status);

    expect(response.body).not.toHaveProperty('token');
  });

  /**
   * @it Prueba de acceso a ruta protegida sin token.
   */
  it('debería devolver 401 si se accede a una ruta protegida sin token', async () => {
  
    const response = await api.get('/api/clientes'); 

    expect(response.status).toBe(401); 

    expect(response.body).not.toHaveProperty('token');
    expect(response.body).toHaveProperty('message');
  });

  /**
   * @it Prueba de registro de un nuevo asesor.
   */
  it('debería registrar un nuevo asesor en estado inactivo y generar un token', async () => {
    
    const nuevoAsesor = {
      legajo: '777777',
      nombre: 'Carlos',
      apellido: 'Prueba',
      email: 'carlos.prueba@sigec.com',
      telefono: '1144445555', 
      password: 'password_segura_777',
      direccion: 'Calle Falsa 123, CABA' 
    };

    const response = await api.post('/api/employees/register')
      .send(nuevoAsesor);
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Asesor registrado exitosamente. La cuenta está inactiva y pendiente de activación.');

    const [rows] = await testPool.query(
      'SELECT * FROM empleados WHERE legajo = ?',
      [nuevoAsesor.legajo]
    );

    expect(rows.length).toBe(1);

    const empleadoDB = rows[0];

    expect(empleadoDB.estado).toBe('inactivo');
    expect(empleadoDB.email_confirmado).toBe(0);
    expect(empleadoDB.reset_password_token).not.toBeNull();
  });
});