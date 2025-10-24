//==========================================================
// CONTROLADOR DE EMPLEADOS
//==========================================================    
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const Employee = require('../models/employeeModel');
const { ROLES, ESTADOS_EMPLEADO } = require('../utils/constants');

//STUBS de funcionde de email
const sendActivationEmail = (email, legajo) => console.log(`Simulando envio de email con link de confirmacion a ${email} para el legajo ${legajo}`);
const sendWelcomeEmail = (email, nombre) => console.log(`Simulando envio de email de bienvenida a ${email} para el empleado ${nombre}`);

//@desc  Registrar un nuevo empleado
//@route POST /api/employees/register
//@access Public
const registerEmployee = asyncHandler(async (req, res) => {
    //capturo los datos del cuerpo de la peticion
    const {
        legajo,
        nombre,
        segundo_nombre,
        apellido,
        segundo_apellido,
        email,
        telefono,
        direccion,
        password,
    } = req.body;

    // Validacion de campos obligatorios
    if (!legajo || !nombre || !apellido || !email || !telefono || !direccion || !password) {
        res.status(400);
        throw new Error('Por favor complete los campos obligatorios.');
    }

    // Verificar si el empleado ya existe
    const employeeExists = await Employee.findByLegajo(legajo);
    if (employeeExists) {
        res.status(409);
        throw new Error('El legajo ya se encuentra registrado.');
    }

    // Encriptar la contraseña Hashear
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear un nuevo empleado en la base de datos
    const newEmployeeData = {
        legajo,
        nombre,
        segundo_nombre: segundo_nombre || null,
        apellido,
        segundo_apellido: segundo_apellido || null,
        email,
        telefono,
        direccion,
        hashedPassword,
    };

    await Employee.create(newEmployeeData);

    // Simular el envio de email de activacion
    sendActivationEmail(email, legajo);

    res.status(201).json({ message: 'Asesor registrado exitosamente. La cuenta está inactiva y pendiente de activación.' });
});

// @desc    Autenticar (login) un empleado
// @route   POST /api/employees/login
// @access  Public
const loginEmployee = asyncHandler(async (req, res) => {
    const { legajo, password } = req.body;
    // Validacion de campos obligatorios
    if (!legajo || !password) {
        res.status(400)
        throw new Error('Por favor complete los campos obligatorios.');
    }

    // Verificar si el empleado existe
    const employee = await Employee.findByLegajo(legajo);

    if (employee && (await bcrypt.compare(password, employee.password))) {
        // Verificar si el empleado está activo
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

// @desc    Obtener todos los empleados (Admin)
// @route   GET /api/employees
// @access  Private/Admin
const getAllEmployees = asyncHandler(async (req, res) => {
    const estadoFilter = req.query.estado || null; // captura el query param del estado
    const employees = await Employee.findAll(estadoFilter);
    res.status(200).json(employees);
});

// @desc    Actualizar detalles/estado/rol de un empleado (Admin)
// @route   PUT /api/employees/status/:legajo
// @access  Private/Admin
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
    const estadosValidos = Object.values(ESTADOS_EMPLEADO);
    const rolesValidos = Object.values(ROLES);

    // 1. Manejo del Estado (Confirmación de Email)
    if (estado) {
        const estadoLower = estado.toLowerCase();

        if (!estadosValidos.includes(estadoLower)) {
            res.status(400);
            throw new Error(`El estado debe ser uno de los siguientes: ${estadosValidos.join(', ')}.`);
        }

        // El Admin NO puede activar si el email no fue confirmado.
        if (estadoLower === ESTADOS_EMPLEADO.ACTIVO && employeeToUpdate.email_confirmado !== 1) {
            res.status(400);
            throw new Error('No se puede activar el usuario. Email no confirmado (pendiente de confirmación del asesor).');
        }

        // Detección de la activación para enviar el email de bienvenida
        if (estadoLower === ESTADOS_EMPLEADO.ACTIVO && employeeToUpdate.estado === ESTADOS_EMPLEADO.INACTIVO) {
            wasActivated = true;
        }
        updateData.estado = estadoLower;
    }

    // 2. Manejo del Rol
    if (rol) {
        const rolLower = rol.toLowerCase();

        if (!rolesValidos.includes(rolLower)) {
            res.status(400);
            throw new Error(`Rol inválido. Debe ser uno de los siguientes: ${rolesValidos.join(', ')}.`);
        }
        updateData.rol = rolLower;
    }

    // 3. Manejo del Supervisor (Asignación y Remoción)
    const currentRol = updateData.rol || employeeToUpdate.rol;

    if (currentRol === ROLES.ASESOR) {
        // Si el Admin quiere asignar un supervisor
        if (supervisor_id) {
            const supervisor = await Employee.findByLegajo(supervisor_id);
            if (!supervisor || (supervisor.rol !== ROLES.SUPERVISOR && supervisor.rol !== ROLES.ADMINISTRADOR)) {
                res.status(400);
                throw new Error('Supervisor asignado inválido. Debe ser Supervisor o Administrador.');
            }
            updateData.supervisor_id = supervisor_id;
            // Si el Admin quiere quitar el supervisor explícitamente enviando supervisor_id: null
        } else if (supervisor_id === null) {
            updateData.supervisor_id = null;
        }
    } else if (currentRol === ROLES.SUPERVISOR || currentRol === ROLES.ADMINISTRADOR) {
        // Forzamos NULL si el rol es Supervisor o Administrador
        updateData.supervisor_id = null;
    }

    // Ejecutar actualización
    const result = await Employee.updateDetails(legajo, updateData);

    // Si se acaba de activar, enviamos el email de bienvenida
    if (wasActivated) {
        sendWelcomeEmail(employeeToUpdate.email, employeeToUpdate.nombre);
    }

    if (result.affectedRows === 0) {
        return res.status(200).json({ message: 'No se realizaron cambios.' });
    }

    res.status(200).json({ message: 'Detalles del empleado actualizados exitosamente.' });
});

//Obtener el perfil del empleado autenticado
//@desc    Obtener el perfil del empleado autenticado
//@route   GET /api/employees/myprofile
//@access  Private
const getMyProfile = async (req, res) => {
    //El middleware de proteccion ya ha verificado el token y agregado el empleado a la solicitud
    const { legajo, nombre, email, rol } = req.employee;
    res.status(200).json({
        legajo,
        nombre,
        email,
        rol
    });
};

// @desc    Ruta de confirmación de email (Link enviado al usuario)
// @route   GET /api/employees/confirm-email/:legajo
// @access  Public
const confirmEmployeeEmail = asyncHandler(async (req, res) => {
    const { legajo } = req.params;
    const result = await Employee.confirmEmail(legajo);

    if (result.affectedRows === 0) {
        res.status(404);
        throw new Error('Confirmación de email fallida o ya confirmada.');
    }
    res.status(200).json({ message: 'Email confirmado exitosamente. La cuenta está pendiente de activación por el Administrador.' });
});

module.exports = {
    registerEmployee,
    loginEmployee,
    getAllEmployees,
    updateEmployeeDetails,
    confirmEmployeeEmail,
    getMyProfile
};
