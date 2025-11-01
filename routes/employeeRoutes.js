//============================================================================
// EMPLOYEE ROUTES
//============================================================================
/**
 * @file employeeRoutes.js
 * @description Rutas para la gestión de empleados y autenticación.
 * @requires express
 * @requires express-rate-limit
 * @requires ../controllers/employeeController.js
 * @requires ../middleware/validationMiddleware.js
 * @requires ../middleware/authMiddleware.js
 * @requires ../middleware/adminMiddleware.js
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerEmployee,
  loginEmployee,
  getAllEmployees,
  updateEmployeeDetails,
  getMyProfile,
  confirmEmployeeEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/employeeController.js');
const {
  validateEmployeeRegistration,
  validateEmployeeLogin,
  validateEmployeeUpdate,
  checkValidation
} = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware.js');
const { isAdmin } = require('../middleware/adminMiddleware.js');

// SEGURIDAD: LÍMITE DE LOGIN (Defensa Fuerza Bruta)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // Límite: 5 intentos de login por IP cada 10 minutos
  message: 'Demasiados intentos de inicio de sesión. Por favor, intente de nuevo en 10 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /employees/register:
 *   post:
 *     tags: [Empleados - Autenticación]
 *     summary: Registra un nuevo empleado (asesor).
 *     description: Endpoint público para registrar un nuevo asesor. La cuenta se crea como 'inactiva' y 'email_no_confirmado'.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpleadoRegister'
 *     responses:
 *       '201':
 *         description: Asesor registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '409':
 *         description: Conflicto (el legajo ya existe).
 */
router.post('/register',
  validateEmployeeRegistration,
  checkValidation,
  registerEmployee
);

/**
 * @swagger
 * /employees/confirm-email/{legajo}:
 *   get:
 *     tags: [Empleados - Autenticación]
 *     summary: Confirma el email de un empleado.
 *     description: Endpoint público (usado desde el link del email) para marcar el email como verificado.
 *     parameters:
 *       - in: path
 *         name: legajo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Email confirmado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '400':
 *         description: Confirmación fallida o ya confirmada.
 */
router.get('/confirm-email/:legajo', confirmEmployeeEmail);

/**
 * @swagger
 * /employees/login:
 *   post:
 *     tags: [Empleados - Autenticación]
 *     summary: Inicia sesión de un empleado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpleadoLogin'
 *     responses:
 *       '200':
 *         description: Login exitoso, devuelve el token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Legajo o contraseña inválidos / Cuenta inactiva.
 */
router.post('/login',
  loginLimiter,
  validateEmployeeLogin,
  checkValidation,
  loginEmployee
);

/**
 * @swagger
 * /employees/myprofile:
 *   get:
 *     tags: [Empleados - Perfil]
 *     summary: Obtiene el perfil del empleado autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Perfil del empleado.
 *       '401':
 *         description: No autorizado.
 */
router.get('/myprofile', protect, getMyProfile);

/**
 * @swagger
 * /employees/:
 *   get:
 *     tags: [Empleados - Admin]
 *     summary: Obtiene la lista de todos los empleados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de empleados.
 *       '401':
 *         description: No autorizado.
 *       '403':
 *         description: No es administrador.
 */
router.get('/', protect, isAdmin, getAllEmployees);

/**
 * @swagger
 * /employees/{legajo}:
 *   put:
 *     tags: [Empleados - Admin]
 *     summary: Actualiza los detalles, estado o rol de un empleado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: legajo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpleadoRegister'
 *     responses:
 *       '200':
 *         description: Empleado actualizado exitosamente.
 *       '401':
 *         description: No autorizado.
 *       '403':
 *         description: No es administrador.
 */
router.put('/:legajo',
  protect,
  isAdmin,
  validateEmployeeUpdate,
  checkValidation,
  updateEmployeeDetails
);

/**
 * @swagger
 * /employees/forgot-password:
 *   post:
 *     tags: [Empleados - Autenticación]
 *     summary: Inicia el proceso de reseteo de contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       '200':
 *         description: Mensaje genérico (para no revelar si el email existe).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /employees/reset-password/{token}:
 *   post:
 *     tags: [Empleados - Autenticación]
 *     summary: Establece la nueva contraseña.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       '200':
 *         description: Contraseña actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '400':
 *         description: Token inválido o expirado.
 */
router.post('/reset-password/:token', resetPassword);


module.exports = router;