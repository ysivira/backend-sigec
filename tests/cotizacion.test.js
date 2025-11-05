//============================================================================
// TEST MODULO COTIZACION
//============================================================================
/**
 * @fileoverview Pruebas de integración para el módulo de cotizaciones.
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

// CICLO DE VIDA
beforeAll(async () => {
  await setupTestDB(); 
});

beforeEach(async () => {
  await testPool.query('SET FOREIGN_KEY_CHECKS = 0;');
  await testPool.query('TRUNCATE TABLE empleados;');
  await testPool.query('TRUNCATE TABLE clientes;');
  await testPool.query('TRUNCATE TABLE planes;');
  await testPool.query('TRUNCATE TABLE listas_de_precios;');
  await testPool.query('SET FOREIGN_KEY_CHECKS = 1;');

  // Asesor
  const passwordPrueba = 'password_de_prueba_123';
  const salt = await bcrypt.genSalt(10);
  const passwordHasheada = await bcrypt.hash(passwordPrueba, salt);
  await testPool.query(
    `INSERT INTO empleados (legajo, nombre, apellido, email, telefono, password, rol, estado, email_confirmado, direccion) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['999999', 'Juan', 'Login', 'juan.login@sigec.com', '1122334455', passwordHasheada, 'asesor', 'activo', 1, 'Calle Falsa 123']
  );

  // Plan 
  await testPool.query(
    "INSERT INTO planes (id, nombre, detalles, activo) VALUES (1, 'Plan 210', 'Plan de prueba', 1)"
  );

  // Precios 
  await testPool.query(
    `INSERT INTO listas_de_precios (plan_id, lista_nombre, tipo_ingreso, rango_etario, precio) VALUES
     
     -- Para Prueba 8 (Voluntario)
     (1, 'Lista 2025', 'Voluntario', '0-25', 10000),      -- (Para Titular 20)
     (1, 'Lista 2025', 'Voluntario', 'hijo 2-20', 5000),   -- (Para Hijo 10 [35-965])
     
     -- Para Prueba 9 (Obligatorio)
     (1, 'Lista 2025', 'Obligatorio', '26-35', 12000)   -- (Para Titular 30)
    `
  );
});

afterAll(async () => {
  await teardownTestDB(); 
  await db.end(); 
});


// LOGIN
const loginAsesor = async () => {
  const response = await api.post('/api/employees/login')
    .send({
      legajo: '999999',
      password: 'password_de_prueba_123'
    });
  return response.body.token;
};


/**
 * @describe Suite de pruebas para el módulo de cotizaciones.
 */
describe('Módulo de Cotización (El Motor de Cálculo)', () => {

  /**
   * @it Prueba para crear una cotización voluntaria.
   */
  it('debería CREAR una cotización VOLUNTARIA simple', async () => {
    
    const token = await loginAsesor();

    const dataCompleta = {
      clienteData: {
        dni: '11223344',
        nombres: 'Cliente Voluntario',
        apellidos: 'Prueba',
        email: 'prueba8@test.com',
        telefono: '1111111111',
        direccion: 'Calle Falsa 123'
      },
      cotizacionData: {
        plan_id: 1,
        tipo_ingreso: 'Voluntario',
        es_casado: false, 
        aportes: 0
      },
      miembrosData: [ 
        { parentesco: 'Titular', edad: 20 }, 
        { parentesco: 'Hijo', edad: 10 }      
      ]
    };

    const response = await api.post('/api/cotizaciones') 
      .set('Authorization', `Bearer ${token}`)
      .send(dataCompleta);
    
    expect(response.status).toBe(201); 
    expect(response.body).toHaveProperty('id'); 
    expect(response.body).toHaveProperty('message', 'Cotización creada exitosamente.');
  });


  /**
   * @it Prueba para crear una cotización obligatoria.
   */
  it('debería CREAR una cotización OBLIGATORIA (Monotributo)', async () => {
    
    const token = await loginAsesor();

    const dataCompleta = {
      clienteData: {
        dni: '22334455',
        nombres: 'Cliente Obligatorio',
        apellidos: 'Prueba',
        email: 'prueba9@test.com',
        telefono: '2222222222',
        direccion: 'Calle Falsa 456'
      },
      cotizacionData: {
        plan_id: 1,
        tipo_ingreso: 'Obligatorio', 
        es_casado: false, 
        aportes: 4000 
      },
      miembrosData: [
        { parentesco: 'Titular', edad: 30 } 
      ]
    };

    const response = await api.post('/api/cotizaciones')
      .set('Authorization', `Bearer ${token}`)
      .send(dataCompleta);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id'); 
    expect(response.body).toHaveProperty('message', 'Cotización creada exitosamente.');
  });


  /**
   * @it Prueba para verificar que la creación de una cotización falla si faltan datos.
   */
  it('debería devolver 400 (Bad Request) si faltan datos clave', async () => {
    const token = await loginAsesor();
    const cotizacionDataIncompleta = {
      plan_id: 1 
    };

    const response = await api.post('/api/cotizaciones')
      .set('Authorization', `Bearer ${token}`)
      .send(cotizacionDataIncompleta);

    expect(response.status).toBe(400); 
    expect(response.body).toHaveProperty('errors');
  });

});