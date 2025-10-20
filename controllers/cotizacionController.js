//============================================================================
// CONTROLADOR DE COTIZACIONES
//============================================================================
const Cotizacion = require('../models/cotizacionModel');
const Cliente = require('../models/clienteModel');

// @desc    Verificar un cliente por DNI 
// @route   GET /api/cotizaciones/verify-dni/:dni
// @access  Private (Asesor)
const verifyDni = async (req, res) => {
    try {
        let { dni } = req.params;

        dni =dni.replace(':', ''); 
        // Obtenemos el legajo del asesor logueado desde el token (req.employee)
        const asesor_logueado_legajo = req.employee.legajo; 
        
        // Verifica si el cliente existe en la tabla clientes 
        const clienteExistente = await Cliente.findByDni(dni);

        if (!clienteExistente) {
            // Cliente NO existe (o no está activo)
            return res.status(200).json({ 
                existe: false, 
                message: 'Cliente no encontrado. Puede proceder a crear una nueva cotización.' 
            });
        }
        // Si el cliente existe, capturamos la informacion para la respuesta 
        const baseResponse = {
             cliente: {
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
        
        // Buscamos la última cotización activa para esa persona.
        const ultimaCotizacion = await Cotizacion.findLastCotizationByDni(dni);

        if (!ultimaCotizacion) {
            // Cliente existe, pero no tiene cotizaciones activas registradas.
             return res.status(200).json({ 
                existe: true, 
                cotizado_por_mi: true, 
                message: 'Cliente encontrado. Puede crear una nueva cotización.',
                ...baseResponse,
                ultima_cotizacion: null
            });
        }

        // El cliente existe y tiene cotizaciones activas
        const asesorCotizadorLegajo = ultimaCotizacion.asesor_legajo;
        
        if (asesorCotizadorLegajo === asesor_logueado_legajo) {
            //  Cotizado por EL MISMO asesor
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
            //  Cotizado por OTRO asesor 
            const fechaFormateada = ultimaCotizacion.fecha_creacion ? new Date(ultimaCotizacion.fecha_creacion).toLocaleDateString('es-AR') : 'Fecha no disponible';
            
            return res.status(409).json({ // 409: Conflict (el recurso existe bajo la gestión de otro)
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

    } catch (error) {
        console.error('Error en verifyDni:', error);
        res.status(500).json({ message: 'Error del servidor al verificar el DNI', error });
    }
};

module.exports = {
  verifyDni,
  
};