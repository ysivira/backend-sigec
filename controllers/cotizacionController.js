//============================================================================
// CONTROLADOR DE COTIZACIONES 
//============================================================================
/**
 * @file clienteController.js
 * @description Controlador para gestionar las operaciones relacionadas con las cotizaciones.
 * @requires express-async-handler
 * @requires ../models/cotizacionModel
 * @requires ../models/clienteModel
 * @requires ../models/planModel
 * @requires ../service/calculoService
 * @requires ../service/pdfService
 */

const asyncHandler = require('express-async-handler');
const Cotizacion = require('../models/cotizacionModel');
const Cliente = require('../models/clienteModel');
const Plan = require('../models/planModel');
const calculoService = require('../service/calculoService');
const pdfService = require('../service/pdfService');

/**
 * Pre-calcular una cotización (Solo matemática, no guarda)
 */
const calculateQuote = asyncHandler(async (req, res) => {
    const { cotizacionData, miembrosData } = req.body;
    if (!cotizacionData || !miembrosData) {
        res.status(400);
        throw new Error("Faltan datos requeridos.");
    }
    const resultado = await calculoService.calcularCotizacion(cotizacionData, miembrosData);
    res.status(200).json(resultado);
});

/**
 * Verificar DNI y devolver datos si existe
 */
const verifyDni = asyncHandler(async (req, res) => {
    let { dni } = req.params;
    dni = dni.replace(':', ''); 
    const asesor_logueado_legajo = req.employee.legajo;
    const clienteExistente = await Cliente.findByDni(dni);

    if (!clienteExistente) {
        return res.status(200).json({
            existe: false,
            message: 'Cliente no encontrado. Puede proceder.'
        });
    }

    const ciudadRecuperada = clienteExistente.direccion || clienteExistente.ciudad || clienteExistente.localidad || '';

    const baseResponse = {
        cliente: {
            id: clienteExistente.id,
            dni: clienteExistente.dni,
            nombres: clienteExistente.nombres,
            apellidos: clienteExistente.apellidos,
            telefono: clienteExistente.telefono,
            email: clienteExistente.email,
            ciudad: ciudadRecuperada,
            direccion: ciudadRecuperada
        },
    };

    const ultimaCotizacion = await Cotizacion.findLastCotizationByDni(dni);
    if (!ultimaCotizacion) {
        return res.status(200).json({
            existe: true,
            cotizado_por_mi: true,
            message: 'Cliente encontrado.',
            ...baseResponse,
            ultima_cotizacion: null
        });
    }

    const asesorCotizadorLegajo = ultimaCotizacion.asesor_legajo;
    if (asesorCotizadorLegajo === asesor_logueado_legajo) {
        const cotizacionCompleta = await Cotizacion.findCotizacionById(ultimaCotizacion.cotizacion_id);
        
        if (cotizacionCompleta.cliente) {
            cotizacionCompleta.cliente.ciudad = ciudadRecuperada;
            cotizacionCompleta.cliente.direccion = ciudadRecuperada;
        }

        return res.status(200).json({
            existe: true,
            cotizado_por_mi: true,
            message: 'Cliente ya cotizado por usted.',
            ...baseResponse,
            datosParaRecotizar: cotizacionCompleta
        });
    } else {
        const fechaFormateada = ultimaCotizacion.fecha_creacion ? new Date(ultimaCotizacion.fecha_creacion).toLocaleDateString('es-AR') : '-';
        return res.status(200).json({
            existe: true,
            cotizado_por_mi: false,
            message: `Cliente ya cotizado por ${ultimaCotizacion.asesor_nombre} ${ultimaCotizacion.asesor_apellido} el ${fechaFormateada}.`,
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

const _getClienteId = async (clienteData, asesor_id) => {
    const { dni, nombres, apellidos, email, telefono, ciudad, direccion } = clienteData;

    if (!dni || !nombres || !apellidos || !email || !telefono) {
        throw new Error('Faltan datos del cliente.');
    }

    
    const ubicacionFinal = direccion || ciudad || '';

    const datosCliente = {
        dni, nombres, apellidos, email, telefono,
        ciudad: ubicacionFinal,    
        direccion: ubicacionFinal,
        asesor_captador_id: asesor_id
    };

    // Verificar existencia
    const clienteExistente = await Cliente.findByDni(dni);

    if (clienteExistente) {
        try {
            if (typeof Cliente.update === 'function') {
                await Cliente.update(clienteExistente.id, datosCliente);
            }
        } catch (err) {
            console.error("No se pudo actualizar el cliente existente:", err);
        }
        return clienteExistente.id;
    }

    const resultCliente = await Cliente.create(datosCliente);
    return resultCliente.insertId;
};

/**
 * Crear cotización final
 */
const createCotizacion = asyncHandler(async (req, res) => {
    const { clienteData, cotizacionData, miembrosData } = req.body;
    const asesor_id = req.employee.legajo;

    let cliente_id;
    try {
        cliente_id = await _getClienteId(clienteData, asesor_id);
    } catch (error) {
        res.status(400);
        throw error;
    }

    if (!cliente_id) {
        res.status(500);
        throw new Error('Error al procesar cliente.');
    }

    // Calcular final
    const { cotizacionCalculada, miembrosConPrecios } = await calculoService.calcularCotizacion(
        cotizacionData, miembrosData
    );

    const fullCotizacionData = {
        ...cotizacionCalculada,
        cliente_id: cliente_id,
        asesor_id: asesor_id
    };

    const result = await Cotizacion.createFullCotizacion(fullCotizacionData, miembrosConPrecios);
    res.status(201).json(result);
});

const updateCotizacion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;
    const { clienteData, cotizacionData, miembrosData } = req.body;

    const cotizacionExistente = await Cotizacion.findCotizacionById(id);
    if (!cotizacionExistente) {
        res.status(404); throw new Error('Cotización no encontrada.');
    }
    if (cotizacionExistente.asesor_id !== asesor_logueado_legajo) {
        res.status(403); throw new Error('No autorizado.');
    }

    // Actualizar cliente también al editar
    if (clienteData) {
        await _getClienteId(clienteData, asesor_logueado_legajo);
    }
    
    const { cotizacionCalculada, miembrosConPrecios } = await calculoService.calcularCotizacion(
        cotizacionData, miembrosData
    );

    const result = await Cotizacion.updateFullCotizacion(id, cotizacionCalculada, miembrosConPrecios);
    res.status(200).json(result);
});

const getCotizacionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;
    const cotizacionCompleta = await Cotizacion.findCotizacionById(id);

    if (cotizacionCompleta) {
        if (cotizacionCompleta.asesor_id !== asesor_logueado_legajo) {
            res.status(403); throw new Error('No tiene permisos.');
        }
        res.status(200).json(cotizacionCompleta);
    } else {
        res.status(404); throw new Error('Cotización no encontrada.');
    }
});

const getCotizacionesByAsesor = asyncHandler(async (req, res) => {
    const asesor_logueado_legajo = req.employee.legajo;
    const cotizaciones = await Cotizacion.findCotizacionesByAsesor(asesor_logueado_legajo);
    res.status(200).json(cotizaciones);
});

const anularCotizacion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;
    const cotizacion = await Cotizacion.findCotizacionById(id);
    if (!cotizacion) {
        res.status(404); throw new Error('Cotización no encontrada.');
    }
    if (cotizacion.asesor_id !== asesor_logueado_legajo) {
        res.status(403); throw new Error('No autorizado.');
    }
    const result = await Cotizacion.anularCotizacion(id);
    if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Anulada exitosamente.' });
    } else {
        res.status(400); throw new Error('Error al anular.');
    }
});

const getCotizacionPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asesor_logueado_legajo = req.employee.legajo;
    const cotizacionCompleta = await Cotizacion.findCotizacionById(id);

    if (!cotizacionCompleta) {
        res.status(404); throw new Error('Cotización no encontrada.');
    }
    if (cotizacionCompleta.asesor_id !== asesor_logueado_legajo) {
        res.status(403); throw new Error('No tiene permisos.');
    }

    try {
        const nombreArchivo = `Cotizacion_${cotizacionCompleta.id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
        pdfService.generarCotizacionPDF(cotizacionCompleta, res);
    } catch (error) {
        console.error("Error PDF:", error);
        if (res.headersSent) res.destroy(error); else res.destroy(error);
    }
});

module.exports = {
    calculateQuote,
    verifyDni,
    createCotizacion,
    getCotizacionById,
    getCotizacionesByAsesor,
    updateCotizacion,
    anularCotizacion,
    getCotizacionPDF
};