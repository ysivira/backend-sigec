//============================================================================
// CONTROLADOR DE COTIZACIONES
//============================================================================

const Cotizacion = require('../models/cotizacionModel');
const Cliente = require('../models/clienteModel');
const Plan = require('../models/planModel');
const asyncHandler = require('express-async-handler');


// @desc    Verificar si un cliente existe por DNI y su estado de cotización
// @route   GET /api/cotizaciones/verify-dni/:dni
// @access  Private (Asesor)        
const verifyDni = asyncHandler(async (req, res) => {
    let { dni } = req.params;
    dni = dni.replace(':', '');
    const asesor_logueado_legajo = req.employee.legajo;
    const clienteExistente = await Cliente.findByDni(dni);

    if (!clienteExistente) {
        return res.status(200).json({
            existe: false,
            message: 'Cliente no encontrado. Puede proceder a crear una nueva cotización.'
        });
    }

    const baseResponse = {
        cliente: {
            id: clienteExistente.id,
            dni: clienteExistente.dni,
            nombres: clienteExistente.nombres,
            apellidos: clienteExistente.apellidos,
            direccion: clienteExistente.direccion,
            codigo_postal: clienteExistente.codigo_postal,
            ciudad: clienteExistente.ciudad,
            provincia: clienteExistente.provincia,
            telefono: clienteExistente.telefono,
        },
    };

    const ultimaCotizacion = await Cotizacion.findLastCotizationByDni(dni);
    if (!ultimaCotizacion) {
        return res.status(200).json({
            existe: true,
            cotizado_por_mi: true,
            message: 'Cliente encontrado. Puede crear una nueva cotización.',
            ...baseResponse,
            ultima_cotizacion: null
        });
    }

    const asesorCotizadorLegajo = ultimaCotizacion.asesor_legajo;
    if (asesorCotizadorLegajo === asesor_logueado_legajo) {
        return res.status(200).json({
            existe: true,
            cotizado_por_mi: true,
            message: 'Cliente ya cotizado por usted. Puede modificar la última cotización o crear una nueva.',
            ...baseResponse,
            ultima_cotizacion: {
                id: ultimaCotizacion.cotizacion_id,
                plan: ultimaCotizacion.plan_nombre,
                fecha_registro: ultimaCotizacion.fecha_creacion,
            }
        });
    } else {
        const fechaFormateada = ultimaCotizacion.fecha_creacion ? new Date(ultimaCotizacion.fecha_creacion).toLocaleDateString('es-AR') : 'Fecha no disponible';
        return res.status(409).json({
            existe: true,
            cotizado_por_mi: false,
            message: `El cliente ya se encuentra cotizado por el asesor ${ultimaCotizacion.asesor_nombre} ${ultimaCotizacion.asesor_apellido} en fecha ${fechaFormateada}.`,
            ...baseResponse,
            asesor_cotizador: {
                nombre: ultimaCotizacion.asesor_nombre,
                apellido: ultimaCotizacion.asesor_apellido,
            },
            fecha_cotizacion: ultimaCotizacion.fecha_creacion,
        });
    }
});

// @desc    Crear una nueva cotización (y cliente si es necesario)
// @route   POST /api/cotizaciones
// @access  Private (Asesor)
const createCotizacion = asyncHandler(async (req, res) => {
    const { clienteData, cotizacionData, miembrosData } = req.body;
    const asesor_id = req.employee.legajo;
    let cliente_id;

    if (!clienteData || !cotizacionData || !miembrosData) {
        res.status(400);
        throw new Error('Faltan datos de cliente, cotización o miembros.');
    }

    // VALIDACIÓN DE PLAN
    const plan_id = cotizacionData.plan_id;
    if (!plan_id) {
        res.status(400);
        throw new Error('No se especificó un plan_id.');
    }

    // Filtra para saber si esta activo
    const plan = await Plan.getById(plan_id);
    if (!plan) {
        // Si el plan no existe O está inactivo, 'plan' será undefined
        res.status(400);
        throw new Error(`El plan ID ${plan_id} no existe o no se encuentra activo.`);
    }

    // LÓGICA DE CLIENTE
    const clienteExistente = await Cliente.findByDni(clienteData.dni);

    if (clienteExistente) {
        cliente_id = clienteExistente.id;
    } else {
        const nuevoClienteData = {
            ...clienteData,
            asesor_captador_id: asesor_id
        };

        const resultCliente = await Cliente.create(nuevoClienteData);
        cliente_id = resultCliente.insertId;
    }

    if (!cliente_id) {
        res.status(500);
        throw new Error('Error al obtener el ID del cliente.');
    }

    // --- LÓGICA DE COTIZACIÓN ---
    const fullCotizacionData = {
        ...cotizacionData,
        cliente_id: cliente_id,
        asesor_id: asesor_id
    };

    const result = await Cotizacion.createFullCotizacion(fullCotizacionData, miembrosData);
    res.status(201).json(result);
});

// @desc    Obtener cotización completa por ID
// @route   GET /api/cotizaciones/:id
// @access  Private (Asesor)
const getCotizacionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cotizacionCompleta = await Cotizacion.findCotizacionById(id);

    if (cotizacionCompleta) {
        res.status(200).json(cotizacionCompleta);
    } else {
        res.status(404);
        throw new Error('Cotización no encontrada.');
    }
});

// @desc    Obtener todas las cotizaciones del asesor logueado
// @route   GET /api/cotizaciones/
// @access  Private (Asesor)
const getCotizacionesByAsesor = asyncHandler(async (req, res) => {
    // Obtenemos el legajo del token
    const asesor_logueado_legajo = req.employee.legajo;

    const cotizaciones = await Cotizacion.findCotizacionesByAsesor(asesor_logueado_legajo);

    res.status(200).json(cotizaciones);
});

// @desc    Actualizar una cotización
// @route   PUT /api/cotizaciones/:id
// @access  Private
const updateCotizacion = asyncHandler(async (req, res) => {
    const { id } = req.params; // ID de la cotización a modificar
    const asesor_logueado_legajo = req.employee.legajo;
    const { cotizacionData, miembrosData } = req.body; // Recibimos el body completo

    if (!cotizacionData || !miembrosData) {
        res.status(400);
        throw new Error('Faltan datos de cotización o miembros.');
    }

    // Validación de Plan
    const plan_id = cotizacionData.plan_id;
    if (!plan_id) {
        res.status(400);
        throw new Error('No se especificó un plan_id.');
    }

    const plan = await Plan.getById(plan_id)
    if (!plan) {
        // Si el plan no existe O está inactivo, 'plan' será undefined
        res.status(400);
        throw new Error(`El plan ID ${plan_id} no existe o no se encuentra activo.`);
    }

    // Verificar que la cotización existe y le pertenece al asesor 
    const cotizacion = await Cotizacion.findCotizacionById(id);
    if (!cotizacion) {
        res.status(404);
        throw new Error('Cotización no encontrada.');
    }

    if (cotizacion.asesor_id !== asesor_logueado_legajo) {
        res.status(403);
        throw new Error('No autorizado para modificar esta cotización.');
    }

    // Si todo está bien, llama al nuevo modelo de actualización completa
    const result = await Cotizacion.updateFullCotizacion(id, cotizacionData, miembrosData);
    res.status(200).json(result); // Devuelve { id: id, message: '...' }
});

// @desc    Anular (borrado lógico) una cotización
// @route   DELETE /api/cotizaciones/:id
// @access  Private (Asesor)
const anularCotizacion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;

    // Verificar que la cotización existe y le pertenece al asesor (Seguridad)
    const cotizacion = await Cotizacion.findCotizacionById(id);
    if (!cotizacion) {
        res.status(404);
        throw new Error('Cotización no encontrada.');
    }

    if (cotizacion.asesor_id !== asesor_logueado_legajo) {
        res.status(403);
        throw new Error('No autorizado para anular esta cotización.');
    }

    // Si todo está bien, anularla (activo = 0)
    const result = await Cotizacion.anularCotizacion(id);

    if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Cotización anulada exitosamente.' });
    } else {
        res.status(400);
        throw new Error('Error al anular la cotización.');
    }
});

module.exports = {
    verifyDni,
    createCotizacion,
    getCotizacionById,
    getCotizacionesByAsesor,
    updateCotizacion,
    anularCotizacion
};