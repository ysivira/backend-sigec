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
        required: ['plan_id', 'edad_desde', 'edad_hasta', 'tipo_ingreso', 'precio'],
        properties: {
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
          parentesco: { type: 'string', enum: ['titular', 'conyuge', 'hijo'], example: 'hijo' },
          edad: { type: 'number', example: 10 }
        }
      },
      CotizacionCreate: {
        type: 'object',
        required: ['cliente_id', 'plan_id', 'tipo_ingreso', 'grupo_familiar'],
        properties: {
          cliente_id: { type: 'number', example: 101 },
          plan_id: { type: 'number', example: 1 },
          tipo_ingreso: { type: 'string', enum: ['monotributo', 'relacion_dependencia'], example: 'monotributo' },
          grupo_familiar: {
            type: 'array',
            items: { $ref: '#/components/schemas/MiembroGrupoFamiliar' },
            example: [
              { parentesco: 'titular', edad: 30 },
              { parentesco: 'conyuge', edad: 28 },
              { parentesco: 'hijo', edad: 5 }
            ]
          }
        }
      },
      CotizacionUpdate: {
        type: 'object',
        properties: {
          cliente_id: { type: 'number', example: 101 },
          plan_id: { type: 'number', example: 1 },
          tipo_ingreso: { type: 'string', enum: ['monotributo', 'relacion_dependencia'], example: 'monotributo' },
          grupo_familiar: {
            type: 'array',
            items: { $ref: '#/components/schemas/MiembroGrupoFamiliar' },
            example: [
              { parentesco: 'titular', edad: 31 }
            ]
          },
          estado: { 
             type: 'string', 
             enum: ['borrador', 'enviada', 'aprobada', 'rechazada'], 
             example: 'enviada'
          },
          motivo_rechazo: {
             type: 'string',
             example: 'El cliente considera que es muy costoso.'
          }
        }
      }


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