//==========================================================
// CONTROLADOR DE EMPLEADOS
//==========================================================    
const bcrypt = require('bcryptjs');
const Employee = require('../models/employeeModel');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

//@desc  Registrar un nuevo empleado
//@route POST /api/employees/register
//@access Public

const registerEmployee = async (req, res) => {
    try {
        //capturo los datos del cuerpo de la peticion
        const {legajo, 
               nombre,
               segundo_nombre,
               apellido,
               segundo_apellido,
               email,
               telefono,
               direccion,
               password,
               rol,
               supervisor_id
            } = req.body;

        // Validacion de campos obligatorios
        if (!legajo || !nombre || !apellido || !email || !password || !rol) {
            return res.status(400).json({ message: 'Por favor complete los campos obligatorios. '});
        }

        // Verificar si el empleado ya existe
        const employeeExists = await Employee.findByLegajo(legajo);
        if (employeeExists) {
            // Usamos 409 Conflict para indicar que el recurso ya existe
            return res.status(409).json({ message: 'El legajo ya se encuentra registrado.' });
        }

        // Encriptar la contraseña Hashear
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear un nuevo empleado en la base de datos
        const newEmployeeData = {
            legajo, 
            nombre, 
            segundo_nombre, 
            apellido, 
            segundo_apellido,
            email, 
            telefono, 
            direccion, 
            hashedPassword, 
            rol, 
            supervisor_id
        };

        await Employee.create(newEmployeeData);

        res.status(201).json({ message: 'Empleado registrado exitosamente' });
    
    }catch (error) {
        console.error('Error al registrar el empleado:', error);
        res.status(500).json({ message: 'Error del servidor. Por favor intente nuevamente mas tarde.' });
    }
};

// @desc    Autenticar (login) un empleado
// @route   POST /api/employees/login
// @access  Public

const loginEmployee = async (req, res) => {
    try {
        const { legajo, password } = req.body;
        // Validacion de campos obligatorios
        if (!legajo || !password) {
            return res.status(400).json({ message: 'Por favor complete los campos obligatorios.' });
        }
        // Verificar si el empleado existe
        const employee = await Employee.findByLegajo(legajo);
        if(employee && await bcrypt.compare(password, employee.password)) {
            const token = jwt.sign(
                { id: employee.legajo, rol: employee.rol },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } 
            );

            res.status(200).json({ 
            message: 'Inicio de sesion exitoso',
            token: token, // enviar el token al cliente
        });
        } else {
            //Si el empleado no existe o la contraseña es incorrecta
            return res.status(401).json({ message: 'Legajo o contraseña incorrectos.' });
        } 
    }catch (error) {
            console.error('Error al iniciar sesion:', error);
            res.status(500).json({ message: 'Error del servidor. Por favor intente nuevamente mas tarde.' });
    }
};
 
//Obtener el perfil del empleado autenticado
//@desc    Obtener el perfil del empleado autenticado
//@route   GET /api/employees/myprofile
//@access  Private
const getMyProfile = async (req, res) => {
    //El middleware de proteccion ya ha verificado el token y agregado el empleado a la solicitud
    const {legajo, nombre, email, rol} = req.employee;
    res.status(200).json({
        legajo,
        nombre,
        email,
        rol
    });
}

module.exports = {
    registerEmployee,   
    loginEmployee,
    getMyProfile
};
