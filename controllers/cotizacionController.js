//============================================================================
// CONTROLADOR DE COTIZACIONES
//============================================================================

const asyncHandler = require('express-async-handler');
const Cotizacion = require('../models/cotizacionModel');
const Cliente = require('../models/clienteModel');
const Plan = require('../models/planModel');
const calculoService = require('../service/calculoService');
const pdfService = require('../service/pdfService');

/**
 * @desc    Verificar si un DNI ya tiene cotización
 * @route   GET /api/cotizaciones/verify-dni/:dni
 * @access  Private (Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
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
        const cotizacionCompleta = await Cotizacion.findCotizacionById(ultimaCotizacion.cotizacion_id);

        return res.status(200).json({
            existe: true,
            cotizado_por_mi: true,
            message: 'Cliente ya cotizado por usted. Puede modificar la última cotización o crear una nueva.',
            ...baseResponse,
            datosParaRecotizar: cotizacionCompleta
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
            datosParaRecotizar: null
        });
    }
});

/**
 * Busca un cliente por DNI o crea uno nuevo si no existe.
 * @private
 * @param {object} clienteData - Datos del cliente.
 * @param {number} asesor_id - ID del asesor que crea el cliente.
 * @returns {Promise<number>} El ID del cliente existente o recién creado.
 */
const _getClienteId = async (clienteData, asesor_id) => {
    const clienteExistente = await Cliente.findByDni(clienteData.dni);

    if (clienteExistente) {
        return clienteExistente.id;
    }

    // Si no existe, validamos los campos mínimos para crear
    const { dni, nombres, apellidos, email, telefono } = clienteData;
    if (!dni || !nombres || !apellidos || !email || !telefono) {
        throw new Error('Faltan datos de cliente (nombre, apellido, email, telefono) para crear un nuevo registro.');
    }

    // Creamos el cliente
    const resultCliente = await Cliente.create({
        ...clienteData,
        asesor_captador_id: asesor_id
    });

    return resultCliente.insertId;
};

/**
 * @desc    Crear una nueva cotización
 * @route   POST /api/cotizaciones
 * @access  Private (Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const createCotizacion = asyncHandler(async (req, res) => {
    const { clienteData, cotizacionData, miembrosData } = req.body;
    const asesor_id = req.employee.legajo;

    // Gestión de Cliente (Buscar o Crear)
    let cliente_id;
    try {
        cliente_id = await _getClienteId(clienteData, asesor_id);
    } catch (error) {
        res.status(400); // Error de datos del cliente
        throw error;
    }

    if (!cliente_id) {
        res.status(500);
        throw new Error('Error al procesar el ID del cliente.');
    }

    const { plan_id } = cotizacionData;
    const nuevoConteoMiembros = miembrosData ? miembrosData.length : 0;

    if (nuevoConteoMiembros > 0) {
        const duplicado = await Cotizacion.findActiveCotizacionByPlanAndMemberCount(
            cliente_id,
            asesor_id,
            plan_id,
            nuevoConteoMiembros
        );

        if (duplicado) {
            res.status(409); // 409 Conflict (Conflicto)
            throw new Error(`Ya existe una cotización activa (ID: ${duplicado.id}) para este cliente, este plan y la misma cantidad de miembros. Por favor, anule la cotización anterior si desea crear una nueva.`);
        }
    }

    const { cotizacionCalculada, miembrosConPrecios } = await calculoService.calcularCotizacion(
        cotizacionData,
        miembrosData
    );

    //  Prepara el objeto final para la DB
    const fullCotizacionData = {
        ...cotizacionCalculada,
        cliente_id: cliente_id,
        asesor_id: asesor_id
    };

    // Guardar en la DB 
    const result = await Cotizacion.createFullCotizacion(fullCotizacionData, miembrosConPrecios);
    res.status(201).json(result); 
});

/**
 * @desc    Actualizar una cotización
 * @route   PUT /api/cotizaciones/:id
 * @access  Private
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const updateCotizacion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;
    const { clienteData, cotizacionData, miembrosData } = req.body;

    // Verificar Autorización (Que la cotización exista y le pertenezca)
    const cotizacionExistente = await Cotizacion.findCotizacionById(id);
    if (!cotizacionExistente) {
        res.status(404);
        throw new Error('Cotización no encontrada.');
    }
    if (cotizacionExistente.asesor_id !== asesor_logueado_legajo) {
        res.status(403);
        throw new Error('No autorizado para modificar esta cotización.');
    }
    // Gestión de Cliente (Buscar o Crear)
    const { cotizacionCalculada, miembrosConPrecios } = await calculoService.calcularCotizacion(
        cotizacionData,
        miembrosData
    );

    // Guardar en la DB 
    const result = await Cotizacion.updateFullCotizacion(id, cotizacionCalculada, miembrosConPrecios);
    res.status(200).json(result);
});

/**
 * @desc    Obtener una cotización completa por ID
 * @route   GET /api/cotizaciones/:id
 * @access  Private (Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const getCotizacionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;
    const cotizacionCompleta = await Cotizacion.findCotizacionById(id);

    if (cotizacionCompleta) {
        if (cotizacionCompleta.asesor_id !== asesor_logueado_legajo) {
            res.status(403);
            throw new Error('No tiene permisos para ver esta cotización.');
        }
        res.status(200).json(cotizacionCompleta);
    } else {
        res.status(404);
        throw new Error('Cotización no encontrada.');
    }
});

/**
 * @desc    Obtener todas las cotizaciones de un asesor
 * @route   GET /api/cotizaciones/asesor
 * @access  Private (Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const getCotizacionesByAsesor = asyncHandler(async (req, res) => {
    const asesor_logueado_legajo = req.employee.legajo;
    const cotizaciones = await Cotizacion.findCotizacionesByAsesor(asesor_logueado_legajo);
    res.status(200).json(cotizaciones);
});

/**
 * @desc    Anular una cotización
 * @route   PUT /api/cotizaciones/anular/:id
 * @access  Private (Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const anularCotizacion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;

    const cotizacion = await Cotizacion.findCotizacionById(id);
    if (!cotizacion) {
        res.status(404);
        throw new Error('Cotización no encontrada.');
    }

    if (cotizacion.asesor_id !== asesor_logueado_legajo) {
        res.status(403);
        throw new Error('No autorizado para anular esta cotización.');
    }

    const result = await Cotizacion.anularCotizacion(id);
    if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Cotización anulada exitosamente.' });
    } else {
        res.status(400);
        throw new Error('Error al anular la cotización.');
    }
});

/**
 * @desc    Generar y descargar una cotización en PDF
 * @route   GET /api/cotizaciones/:id/pdf
 * @access  Private (Asesor)
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const getCotizacionPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;

    // Obtener los datos completos
    const cotizacionCompleta = await Cotizacion.findCotizacionById(id);

    if (!cotizacionCompleta) {
        res.status(404);
        throw new Error('Cotización no encontrada.');
    }

    // Validar permisos 
    if (cotizacionCompleta.asesor_id !== asesor_logueado_legajo) {
        res.status(403);
        throw new Error('No tiene permisos para ver esta cotización.');
    }

    try {
        // Preparar la respuesta HTTP para que el navegador descargue un PDF
        const nombreArchivo = `Cotizacion_${cotizacionCompleta.id}_${cotizacionCompleta.cliente.dni}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);

        // Crear el pdf y enviarlo en la respuesta; Si falla, el catch local atrapará el error.
        pdfService.generarCotizacionPDF(cotizacionCompleta, res);

    } catch (error) {
        // Error síncrono durante la generación del PDF
        console.error("Error síncrono en getCotizacionPDF:", error);

        // Si 'headersSent' es true, el stream ya empezó. No podemos enviar JSON. Solo podemos destruir el stream.
        if (res.headersSent) {
            res.destroy(error);
        } else {
            // Si los headers no se enviaron, algo falló antes.
            res.destroy(error);
        }
    }
});

module.exports = {
    verifyDni,
    createCotizacion,
    getCotizacionById,
    getCotizacionesByAsesor,
    updateCotizacion,
    anularCotizacion,
    getCotizacionPDF
};