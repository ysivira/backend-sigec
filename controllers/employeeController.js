//==========================================================
// CONTROLADOR DE EMPLEADOS (Actualizado con Reseteo de Password)
//==========================================================
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Para los tokens de reseteo
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const Employee = require('../models/employeeModel'); // Usamos 'Employee' como en tu archivo
const { ROLES, ESTADOS_EMPLEADO } = require('../utils/constants');

// Importamos el servicio de email REAL
const { 
  sendPasswordResetEmail, 
  sendActivationEmail, 
  sendWelcomeEmail 
} = require('../service/emailService'); 

//@desc  Registrar un nuevo empleado
//@route POST /api/employees/register
//@access Public
const registerEmployee = asyncHandler(async (req, res) => {
    const {
        legajo, nombre, segundo_nombre, apellido, segundo_apellido,
        email, telefono, direccion, password,
    } = req.body;
    const employeeExists = await Employee.findByLegajo(legajo);
    if (employeeExists) {
        res.status(409);
        throw new Error('El legajo ya se encuentra registrado.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newEmployeeData = {
        legajo, nombre, segundo_nombre: segundo_nombre || null,
        apellido, segundo_apellido: segundo_apellido || null,
        email, telefono, direccion, hashedPassword,
    };
    await Employee.create(newEmployeeData);

    // Enviar email de activación
    sendActivationEmail(email, legajo); 
    res.status(201).json({ message: 'Asesor registrado exitosamente. La cuenta está inactiva y pendiente de activación.' });
});

// @desc    Autenticar (login) un empleado
// @route   POST /api/employees/login
// @access  Public
const loginEmployee = asyncHandler(async (req, res) => {
    const { legajo, password } = req.body;
    const employee = await Employee.findByLegajo(legajo);
    if (employee && (await bcrypt.compare(password, employee.password))) {
        if (employee.estado !== 'activo') {
            res.status(401);
            throw new Error('Cuenta inactiva o pendiente de activación')
        }
        res.json({
            id: employee.legajo,
            legajo: employee.legajo,
            nombre: employee.nombre,
            apellido: employee.apellido,
            rol: employee.rol,
            token: generateToken(employee.legajo, employee.rol),
        });
    } else {
        res.status(401);
        throw new Error('Legajo o contraseña inválidos.');
    }
});

// @desc    Obtener todos los empleados (Admin)
// @route   GET /api/employees
// @access  Private/Admin
const getAllEmployees = asyncHandler(async (req, res) => {
    const estadoFilter = req.query.estado || null;
    const employees = await Employee.findAll(estadoFilter);
    res.status(200).json(employees);
});

// @desc    Actualizar detalles/estado/rol de un empleado (Admin)
// @route   PUT /api/employees/status/:legajo
// @access  Private/Admin
const updateEmployeeDetails = asyncHandler(async (req, res) => {
    const { legajo } = req.params;
    const { estado, rol, supervisor_id } = req.body;
    const employeeToUpdate = await Employee.findByLegajo(legajo);
    if (!employeeToUpdate) {
        res.status(404);
        throw new Error('Empleado no encontrado.');
    }
    const updateData = {};
    let wasActivated = false;
    if (estado) {
        if (estado === ESTADOS_EMPLEADO.ACTIVO && employeeToUpdate.email_confirmado !== 1) {
            res.status(400);
            throw new Error('No se puede activar el usuario. Email no confirmado (pendiente de confirmación del asesor).');
        }
        if (estado === ESTADOS_EMPLEADO.ACTIVO && employeeToUpdate.estado === ESTADOS_EMPLEADO.INACTIVO) {
            wasActivated = true;
        }
        updateData.estado = estado;
    }
    if (rol) {
        updateData.rol = rol;
    }
    const currentRol = updateData.rol || employeeToUpdate.rol;
    if (currentRol === ROLES.ASESOR) {
        if (supervisor_id) {
            const supervisor = await Employee.findByLegajo(supervisor_id);
            if (!supervisor || (supervisor.rol !== ROLES.SUPERVISOR && supervisor.rol !== ROLES.ADMINISTRADOR)) {
                res.status(400);
                throw new Error('Supervisor asignado inválido. Debe ser Supervisor o Administrador.');
            }
            updateData.supervisor_id = supervisor_id;
        } else if (supervisor_id === null) {
            updateData.supervisor_id = null;
        }
    } else if (currentRol === ROLES.SUPERVISOR || currentRol === ROLES.ADMINISTRADOR) {
        updateData.supervisor_id = null;
    }
    const result = await Employee.updateDetails(legajo, updateData);
    if (wasActivated) {
        sendWelcomeEmail(employeeToUpdate.email, employeeToUpdate.nombre);
    }
    if (result.affectedRows === 0) {
        return res.status(200).json({ message: 'No se realizaron cambios.' });
    }
    res.status(200).json({ message: 'Detalles del empleado actualizados exitosamente.' });
});

// @desc    Obtener el perfil del empleado autenticado
// @route   GET /api/employees/myprofile
// @access  Private
const getMyProfile = async (req, res) => {
    const { legajo, nombre, email, rol } = req.employee;
    res.status(200).json({
        legajo,
        nombre,
        email,
        rol
    });
};

// @desc    Ruta de confirmación de email (Link enviado al usuario)
// @route   GET /api/employees/confirm-email/:legajo
// @access  Public
const confirmEmployeeEmail = asyncHandler(async (req, res) => {
    const { legajo } = req.params;
    const result = await Employee.confirmEmail(legajo);
    if (result.affectedRows === 0) {
        res.status(400);
        throw new Error('Confirmación de email fallida o ya confirmada.');
    }
    res.status(200).json({ message: 'Email confirmado exitosamente. La cuenta está pendiente de activación por el Administrador.' });
});

// Olvidé mi contraseña 

/**
 * @desc    Solicitar reseteo de contraseña.
 * @route   POST /api/employees/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const employee = await Employee.findByEmail(email); 
    if (!employee) {
      // No revelar si el email existe o no
      return res.status(200).json({ message: 'Si existe una cuenta con ese email, se ha enviado un enlace de reseteo.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en DB
    await Employee.saveResetToken(employee.legajo, hashedToken, expires);

    try {
      // Enviar el email (con el token SIN hashear)
      await sendPasswordResetEmail(employee.email, resetToken);
      res.status(200).json({ message: 'Si existe una cuenta con ese email, se ha enviado un enlace de reseteo.' });
    
    } catch (emailError) {
      console.error(emailError);
      // Si falla el envío de email, no podemos dejar al usuario sin saberlo
      res.status(500);
      throw new Error('Error al enviar el email. Por favor, intente de nuevo más tarde.');
    }
});

/**
 * @desc    Resetear la contraseña.
 * @route   POST /api/employees/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!newPassword || newPassword.length < 6) {
        res.status(400);
        throw new Error('La contraseña es requerida y debe tener al menos 6 caracteres.');
    }
    
    // Hashear el token que viene del link para buscarlo en la DB
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Buscar si el token es válido y no ha expirado 
    const employee = await Employee.findByResetToken(hashedToken);
    
    if (!employee) {
        res.status(400);
        throw new Error('Token inválido o expirado. Por favor, solicita un nuevo reseteo.');
    }

    // Si es válido, hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña y limpiar el token de reseteo
    await Employee.updatePasswordAndClearToken(employee.legajo, hashedPassword);

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
});

module.exports = {
    registerEmployee,
    loginEmployee,
    getAllEmployees,
    updateEmployeeDetails,
    confirmEmployeeEmail,
    getMyProfile,
    forgotPassword, 
    resetPassword,  
};