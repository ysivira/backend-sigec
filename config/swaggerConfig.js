//============================================================================
// CONFIGURACIÓN DE SWAGGER PARA LA API DE SIGEC
//============================================================================= 

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  // Información de la API (OpenAPI)
  openapi: '3.0.0',
  info: {
    title: 'API de SIGEC (Sistema de Gestión de Cotizaciones)',
    version: '1.0.0',
    description: 'Documentación oficial de la API de SIGEC, usada para el frontend de React.',
    contact: {
      name: 'Yurlian Sivira',
      email: 'yurliansivira@gmail.com',
    },
  },
  // Servidores
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Servidor de desarrollo local',
    },
  ],
  // Definición de Seguridad (para el token JWT) y Schemas
  components: {
    securitySchemes: {
      bearerAuth: { 
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de autenticación JWT (Bearer). Ingresar así: "Bearer [tu_token]"',
      },
    },

    schemas: {
        // shema de Request Body
        EmpleadoRegister: {
        type: 'object',
        required: ['legajo', 'nombre', 'apellido', 'email', 'password', 'telefono', 'direccion'],
        properties: {
          legajo: { type: 'string', example: '12345678' },
          nombre: { type: 'string', example: 'Juan' },
          segundo_nombre: { type: 'string', example: 'Carlos' },
          apellido: { type: 'string', example: 'Perez' },
          segundo_apellido: { type: 'string', example: 'Gomez' },
          email: { type: 'string', format: 'email', example: 'juan.perez@sigec.com' },
          telefono: { type: 'string', example: '1155443322' },
          direccion: { type: 'string', example: 'Av. Siempre Viva 123' },
          password: { type: 'string', format: 'password', example: 'juan123456' }
        }
      },
      EmpleadoLogin: {
        type: 'object',
        required: ['legajo', 'password'],
        properties: {
          legajo: { type: 'string', example: '12345678' },
          password: { type: 'string', format: 'password', example: 'juan123456' }
        }
      },
      ForgotPassword: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'juan.perez@sigec.com' }
        }
      },
      ResetPassword: {
        type: 'object',
        required: ['newPassword'],
        properties: {
          newPassword: { type: 'string', format: 'password', example: 'miNuevaClave123' }
        }
      },
      EmpleadoUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string', example: 'Juan' },
          segundo_nombre: { type: 'string', example: 'Carlos' },
          apellido: { type: 'string', example: 'Perez' },
          segundo_apellido: { type: 'string', example: 'Gomez' },
          email: { type: 'string', format: 'email', example: 'juan.perez@sigec.com' },
          telefono: { type: 'string', example: '1155443322' },
          direccion: { type: 'string', example: 'Av. Siempre Viva 123' },
          estado: { type: 'string', enum: ['activo', 'inactivo', 'pendiente'], example: 'activo' },
          rol: { type: 'string', enum: ['admin', 'supervisor', 'asesor'], example: 'asesor' },
          supervisor_id: { type: 'string', nullable: true, example: '40123456' },
          email_confirmado: { type: 'boolean', example: true }
        }
      },
      
      // Schemas de Respuesta
      ApiResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Operación exitosa.' }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error en la operación.' },
          stack: { type: 'string', example: 'Error: ...' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '12345678' },
          legajo: { type: 'string', example: '12345678' },
          nombre: { type: 'string', example: 'Juan' },
          apellido: { type: 'string', example: 'Perez' },
          rol: { type: 'string', example: 'asesor' },
          token: { type: 'string', format: 'jwt', example: 'eyJhbGciOiJIUzI1Ni...' }
        }
      },
      PriceListEntry: {
        type: 'object',
        required: ['lista_nombre', 'plan_id', 'edad_desde', 'edad_hasta', 'tipo_ingreso', 'precio'], // <-- Añadido
        properties: {
          lista_nombre: { type: 'string', enum: ['Obligatorio', 'Voluntario'], example: 'Obligatorio' }, // <-- AÑADIDO
          plan_id: { type: 'number', example: 1 },
          edad_desde: { type: 'number', example: 0 },
          edad_hasta: { type: 'number', example: 17 },
          tipo_ingreso: { type: 'string', enum: ['monotributo', 'relacion_dependencia'], example: 'monotributo' },
          precio: { type: 'number', format: 'float', example: 15000.50 }
        }
      },
      Plan: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          nombre: { type: 'string', example: 'Plan Básico' },
          detalles: { type: 'string', example: 'Cobertura básica.' },
          condiciones_generales: { type: 'string', example: 'Sin carencias.' },
          activo: { type: 'boolean', example: true }
        }
      },
      PlanCreate: {
        type: 'object',
        required: ['nombre', 'detalles', 'condiciones_generales', 'activo'],
        properties: {
          nombre: { type: 'string', example: 'Plan Básico' },
          detalles: { type: 'string', example: 'Cobertura básica.' },
          condiciones_generales: { type: 'string', example: 'Sin carencias.' },
          activo: { type: 'boolean', example: true }
        }
      },
      Cliente: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 101 },
          dni: { type: 'string', example: '30123456' },
          nombres: { type: 'string', example: 'Maria' },
          apellidos: { type: 'string', example: 'Gomez' },
          email: { type: 'string', example: 'maria.gomez@cliente.com' },
          telefono: { type: 'string', example: '1122334455' },
          direccion: { type: 'string', example: 'Calle Falsa 456' },
          asesor_id: { type: 'string', example: '40123456' }
        }
      },
      ClienteCreate: {
        type: 'object',
        required: ['dni', 'nombres', 'apellidos', 'email', 'telefono', 'direccion'],
        properties: {
          dni: { type: 'string', example: '30123456' },
          nombres: { type: 'string', example: 'Maria' },
          apellidos: { type: 'string', example: 'Gomez' },
          email: { type: 'string', example: 'maria.gomez@cliente.com' },
          telefono: { type: 'string', example: '1122334455' },
          direccion: { type: 'string', example: 'Calle Falsa 456' }
        }
      },
      MiembroGrupoFamiliar: {
        type: 'object',
        required: ['parentesco', 'edad'],
        properties: {
          parentesco: { type: 'string', enum: ['Titular', 'Conyuge', 'Hijo'], example: 'Hijo' },
          edad: { type: 'number', example: 10 }
        }
      },
      CotizacionClienteData: {
        type: 'object',
        required: ['dni', 'nombres', 'apellidos', 'email', 'telefono'],
        properties: {
          dni: { type: 'string', example: '99998891' },
          nombres: { type: 'string', example: 'Prueba' },
          apellidos: { type: 'string', example: 'Obligatorio' },
          email: { type: 'string', example: 'matri-obli@test.com' },
          telefono: { type: 'string', example: '999111' }
        }
      },
      CotizacionCoreData: {
        type: 'object',
        required: ['plan_id', 'tipo_ingreso', 'es_casado'],
        properties: {
          plan_id: { type: 'number', example: 2 },
          tipo_ingreso: { type: 'string', enum: ['Obligatorio', 'Voluntario'], example: 'Obligatorio' },
          es_casado: { type: 'boolean', example: true },
          aporte_obra_social: { type: 'number', example: 42234.12 },
          descuento_comercial_pct: { type: 'number', example: 45 },
          descuento_afinidad_pct: { type: 'number', example: 0 },
          descuento_tarjeta_pct: { type: 'number', example: 5 },
          monotributo_categoria: { type: 'string', nullable: true, example: null },
          monotributo_adherentes: { type: 'number', example: 0 },
          comentarios: { type: 'string', example: 'Prueba Plan Esmeralda...' }
        }
      },
      CotizacionPayload: {
        type: 'object',
        required: ['clienteData', 'cotizacionData', 'miembrosData'],
        properties: {
          clienteData: { $ref: '#/components/schemas/CotizacionClienteData' },
          cotizacionData: { $ref: '#/components/schemas/CotizacionCoreData' },
          miembrosData: {
            type: 'array',
            items: { $ref: '#/components/schemas/MiembroGrupoFamiliar' }
          }
        }
      },
    }
  },
  security: [
    {
      bearerAuth: [], 
    },
  ],
};

const options = {
  swaggerDefinition,
    apis: ['./routes/*.js'], 
};

// Generamos la especificación de Swagger
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;