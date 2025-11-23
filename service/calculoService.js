//============================================================================
// SERVICE: CÁLCULO DE COTIZACIONES 
//============================================================================
/**
 * @file calculoService.js
 * @description Servicio encargado del cálculo de cotizaciones.
 * @requires ../models/priceListModel
 * @requires ../models/monotributoModel
 * @requires ../utils/constants
 */ 

const priceListModel = require('../models/priceListModel');
const monotributoModel = require('../models/monotributoModel');
const { PARENTESCOS, TIPOS_INGRESO } = require('../utils/constants');

/**
 * Traduce la edad y el parentesco a un rango etario específico del tarifario.
 * @private
 * @param {number} edad - La edad del miembro.
 * @param {string} parentesco - El parentesco del miembro (e.g., 'TITULAR', 'HIJO').
 * @param {boolean} es_casado - Si el titular es casado.
 * @returns {string|null} El rango etario para la búsqueda de precios o null si no aplica.
 */
const _traducirRangoEtario = (edad, parentesco, es_casado) => {
    // Lógica para Hijos
    if (parentesco === PARENTESCOS.HIJO) {
        if (edad <= 1) return 'hijo 0-1';
        if (edad <= 20) return 'hijo 2-20';
        if (edad <= 29) return 'hijo 21-29';
        if (edad <= 39) return 'hijo 30-39';
        if (edad <= 49) return 'hijo 40-49';
        // Hijo > 49 cotiza como titular soltero
    }
    // Lógica para Cónyuge
    if (parentesco === PARENTESCOS.CONYUGE) {
        return null; // Precio $0
    }
    // Lógica para Titular
    let rango = '';
    if (edad <= 25) rango = '0-25';
    else if (edad <= 35) rango = '26-35';
    else if (edad <= 40) rango = '36-40';
    else if (edad <= 50) rango = '41-50';
    else if (edad <= 60) rango = '51-60';
    else if (edad <= 65) rango = '61-65';
    else rango = '66-00';

    // Aplica "MAT" si es titular y casado
    if (parentesco === PARENTESCOS.TITULAR && es_casado) {
        return `MAT ${rango}`;
    } else {
        return rango;
    }
};

/**
 * Obtiene el precio individual de un miembro del grupo familiar.
 * @private
 * @param {object} miembro - Objeto del miembro con edad y parentesco.
 * @param {number} plan_id - El ID del plan seleccionado.
 * @param {string} tipo_ingreso - El tipo de ingreso del titular.
 * @param {boolean} es_casado - Si el titular es casado.
 * @returns {Promise<number>} El precio individual del miembro.
 */
const _getPrecioIndividual = async (miembro, plan_id, tipo_ingreso, es_casado) => {
    const { edad, parentesco } = miembro;

    const rango_etario_traducido = _traducirRangoEtario(edad, parentesco, es_casado);

    if (rango_etario_traducido === null) {
        return 0; // Cónyuge
    }

    let lista_a_buscar = tipo_ingreso;
    if (tipo_ingreso === TIPOS_INGRESO.MONOTRIBUTO) {
        lista_a_buscar = TIPOS_INGRESO.OBLIGATORIO;
    }

    const precio = await priceListModel.findPrecio(
        plan_id,
        lista_a_buscar,
        rango_etario_traducido
    );

    // Asegura que el precio es un número válido
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum)) {
        console.error(`Error: El precio obtenido para plan ${plan_id}, tipo ${lista_a_buscar}, rango ${rango_etario_traducido} no es un número: ${precio}`);
        throw new Error(`Error de configuración: Precio inválido para el rango ${rango_etario_traducido}.`);
    }
    return precioNum;
};

/**
 * Orquesta el cálculo completo de una cotización, incluyendo descuentos y aportes.
 * @param {object} cotizacionData - Datos principales de la cotización.
 * @param {Array<object>} miembrosData - Array con los datos de los miembros del grupo familiar.
 * @returns {Promise<object>} Un objeto con la cotización calculada y los precios por miembro.
 */
const calcularCotizacion = async (cotizacionData, miembrosData) => {

    // Extracción Inputs 
    const {
        plan_id, tipo_ingreso, es_casado, aporte_obra_social,
        descuento_comercial_pct, descuento_afinidad_pct,
        descuento_tarjeta_pct, 
        monotributo_categoria, monotributo_adherentes
    } = cotizacionData;

    const descComercialPct = parseFloat(descuento_comercial_pct) || 0;
    const descAfinidadPct = parseFloat(descuento_afinidad_pct) || 0;
    const descTarjetaPct = parseFloat(descuento_tarjeta_pct) || 0; 
    const esCasadoBool = es_casado === true || es_casado === 1 || es_casado === 'true';

    // Calcula Precio Base 
    let valor_base_plan = 0;
    const miembrosConPrecios = [];

    for (const miembro of miembrosData) {
        const edadNum = parseInt(miembro.edad);
        if (isNaN(edadNum)) {
            throw new Error(`La edad '${miembro.edad}' para el miembro con parentesco '${miembro.parentesco}' no es un número válido.`);
        }
        const precioMiembro = await _getPrecioIndividual({ ...miembro, edad: edadNum }, plan_id, tipo_ingreso, esCasadoBool);
        const precioMiembroNum = parseFloat(precioMiembro);
        if (isNaN(precioMiembroNum)) {
            console.error(`Error: El precio obtenido para ${miembro.parentesco} edad ${edadNum} no es número: ${precioMiembro}`);
            throw new Error(`Error de configuración de precios. Verifique la lista para el plan ${plan_id}.`);
        }
        valor_base_plan += precioMiembroNum;
        miembrosConPrecios.push({
            ...miembro,
            edad: edadNum,
            valor_individual: parseFloat(precioMiembroNum.toFixed(2))
        });
    }
    valor_base_plan = parseFloat(valor_base_plan.toFixed(2));

    // Lógica Dto. Joven (Automático) 
    let descJovenPct = 0;
    const titular = miembrosConPrecios.find(m => m.parentesco === PARENTESCOS.TITULAR);
    const soloHijos = miembrosConPrecios.every(m => m.parentesco === PARENTESCOS.TITULAR || m.parentesco === PARENTESCOS.HIJO);
    const edadTitular = titular ? titular.edad : null;

    if (edadTitular !== null && edadTitular < 26 && !esCasadoBool && soloHijos) {
        descJovenPct = 30; // 30% automático
    }

    // Cálculo de Topes 
    let descuento_comercial_pct_final = descComercialPct;
    let descuento_afinidad_pct_final = descAfinidadPct;
    let descuento_joven_pct_final = descJovenPct;
    let descuento_tarjeta_pct_final = descTarjetaPct;

    let sumaDescuentosPct = descComercialPct + descAfinidadPct + descJovenPct + descTarjetaPct;
    // El tope es 55% si aplica tarjeta, 50% si no.
    const topeMaximo = (descTarjetaPct > 0) ? 55 : 50;

    if (sumaDescuentosPct > topeMaximo) {
        // Si la suma supera el tope, informa el error al asesor
       throw new Error(`El total de descuentos (${sumaDescuentosPct.toFixed(2)}%) excede el tope máximo permitido de ${topeMaximo}%.`);
    }

    // Cálculo Descuentos $ y Subtotal 
     let saldo = valor_base_plan;

    // A) Descuento Afinidad
    const valor_descuento_afinidad = parseFloat(((saldo * descAfinidadPct) / 100).toFixed(2));
    saldo -= valor_descuento_afinidad;

    // B) Descuento Comercial
    const valor_descuento_comercial = parseFloat(((saldo * descComercialPct) / 100).toFixed(2));
    saldo -= valor_descuento_comercial;

    // C) Descuento Joven (Si aplica)
    const valor_descuento_joven = parseFloat(((saldo * descJovenPct) / 100).toFixed(2));
    saldo -= valor_descuento_joven;

    // D) Descuento Tarjeta (Último descuento porcentual)
    const valor_descuento_tarjeta = parseFloat(((saldo * descTarjetaPct) / 100).toFixed(2));
    saldo -= valor_descuento_tarjeta;

    // Subtotal neto antes de impuestos/aportes
    const subtotal = parseFloat(saldo.toFixed(2));

    // Calculamos el total descontado para referencia (informativo)
    const valor_descuento_total = parseFloat((valor_base_plan - subtotal).toFixed(2));

    // Lógica Aportes/Impuestos 
    let valor_total = subtotal;
    let sueldo_bruto = 0;
    let valor_aportes_estimados = 0;
    let valor_aporte_monotributo = 0;
    let valor_iva = 0;
    
    const aporteOSNum = parseFloat(aporte_obra_social) || 0;
    const adherentesMono = parseInt(monotributo_adherentes) || 0;

    switch (tipo_ingreso) {
        case TIPOS_INGRESO.OBLIGATORIO:
            sueldo_bruto = aporteOSNum > 0 ? parseFloat((aporteOSNum / 0.03).toFixed(2)) : 0;
            const topeSueldoBruto = 3500000; 
            let sueldoBrutoParaAporte = Math.min(sueldo_bruto, topeSueldoBruto);
            let aporteEstimadoCalculado = parseFloat((sueldoBrutoParaAporte * 0.09).toFixed(2));
            valor_aportes_estimados = parseFloat(Math.min(subtotal, aporteEstimadoCalculado).toFixed(2));
            valor_total = subtotal - valor_aportes_estimados;
            break;
        case TIPOS_INGRESO.MONOTRIBUTO:
            const aporteTitular = await monotributoModel.findAporteByCategoria(monotributo_categoria);
            const aporteAdherente = await monotributoModel.findAporteAdherente();
            const aporteTitularNum = parseFloat(aporteTitular) || 0;
            const aporteAdherenteNum = parseFloat(aporteAdherente) || 0;
            const aporteMonoTotalCalculado = aporteTitularNum + (aporteAdherenteNum * adherentesMono);
            valor_aporte_monotributo = parseFloat(Math.min(subtotal, aporteMonoTotalCalculado).toFixed(2));
            valor_total = subtotal - valor_aporte_monotributo;
            break;
        case TIPOS_INGRESO.VOLUNTARIO:
        default:
            valor_iva = parseFloat((subtotal * 0.105).toFixed(2));
            valor_total = subtotal + valor_iva;
            break;
    }
    valor_total = parseFloat(Math.max(0, valor_total).toFixed(2));

    // --- Objeto Devuelto 
    const cotizacionCalculada = {
        ...cotizacionData,
        valor_base_plan,
        descuento_comercial_pct: descuento_comercial_pct_final,
        descuento_afinidad_pct: descuento_afinidad_pct_final,
        descuento_joven_pct: descuento_joven_pct_final,       
        descuento_tarjeta_pct: descuento_tarjeta_pct_final,   
        valor_descuento_comercial,
        valor_descuento_afinidad,
        valor_descuento_joven,   
        valor_descuento_tarjeta, 
        sueldo_bruto,
        valor_aportes_estimados,
        valor_aporte_monotributo,
        valor_iva,
        valor_total
    };

    return { cotizacionCalculada, miembrosConPrecios };
};

module.exports = {
    calcularCotizacion,
};