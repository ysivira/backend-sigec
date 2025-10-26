//============================================================================
// SERVICE: CÁLCULO DE COTIZACIONES
//============================================================================

const priceListModel = require('../models/priceListModel');
const monotributoModel = require('../models/monotributoModel');
const { PARENTESCOS, TIPOS_INGRESO } = require('../utils/constants');

/**
 * TRADUCTOR (Función Privada)
 * Traduce una edad y parentesco al "rango_etario" de la DB.
 * Ej: (30, 'Titular', true) -> "MAT 21-30"
 * Ej: (30, 'Titular', false) -> "21-30"
 * Ej: (8, 'Hijo') -> "hijo 2-20"
 */
const _traducirRangoEtario = (edad, parentesco, es_casado) => {
    // Lógica para Hijos  Rangos: (0-1), (2-20), (21-29), (30-39), (40-49)
    if (parentesco === PARENTESCOS.HIJO) {
        if (edad <= 1) return 'hijo 0-1';
        if (edad <= 20) return 'hijo 2-20';
        if (edad <= 29) return 'hijo 21-29';
        if (edad <= 39) return 'hijo 30-39';
        if (edad <= 49) return 'hijo 40-49';
        // Si es "hijo" > 49, se cotiza como un titular soltero
    }

    // Lógica para Cónyuge
    if (parentesco === PARENTESCOS.CONYUGE) {
        // El precio del cónyuge va incluido en el "MAT" del titular
        return null; // Devolver null significa precio $0
    }

    // Lógica para Titular Rangos: (0-25), (26-35), (36-40), (41-50), (51-60), (61-65), (66-00)
    let rango = '';
    if (edad <= 25) rango = '0-25';
    else if (edad <= 35) rango = '26-35';
    else if (edad <= 40) rango = '36-40';
    else if (edad <= 50) rango = '41-50';
    else if (edad <= 60) rango = '51-60';
    else if (edad <= 65) rango = '61-65';
    else rango = '66-00';

    // La regla de negocio clave
    if (parentesco === PARENTESCOS.TITULAR && es_casado) {
        return `MAT ${rango}`;
    } else {
        return rango;
    }
};

/**
 * TRADUCTOR (Función Privada)
 * Llama al "Traductor" y luego busca el precio en el Modelo.
 */
const _getPrecioIndividual = async (miembro, plan_id, tipo_ingreso, es_casado) => {
    const { edad, parentesco } = miembro;

    const rango_etario_traducido = _traducirRangoEtario(edad, parentesco, es_casado);

    if (rango_etario_traducido === null) {
        // Esto es un Cónyuge, precio 0
        return 0;
    }

    // Seleccion de la lista de precios correcta segun el tipo_ingreso.
    let lista_a_buscar = tipo_ingreso;

    if (tipo_ingreso === TIPOS_INGRESO.MONOTRIBUTO) {
        // Monotributo usa la lista de precio obligatorio 
        lista_a_buscar = TIPOS_INGRESO.OBLIGATORIO;
    }

    const precio = await priceListModel.findPrecio(
        plan_id,
        lista_a_buscar,
        rango_etario_traducido
    );

    return precio;
};

/**
 * CALCULADORA PRINCIPAL 
 * Orquesta todos los cálculos.
 */
const calcularCotizacion = async (cotizacionData, miembrosData) => {

    // Extrae los "Inputs" del Asesor
    const {
        plan_id, tipo_ingreso, es_casado, aporte_obra_social,
        descuento_comercial_pct, descuento_afinidad_pct,
        monotributo_categoria, monotributo_adherentes
    } = cotizacionData;

    // Calcula el Precio Base (Suma de Miembros)
    let valor_base_plan = 0;
    const miembrosConPrecios = [];

    for (const miembro of miembrosData) {
        const precioMiembro = await _getPrecioIndividual(miembro, plan_id, tipo_ingreso, es_casado);
        valor_base_plan += precioMiembro;
        miembrosConPrecios.push({
            ...miembro,
            valor_individual: precioMiembro // Guardamos el precio individual
        });
    }

    // Calcula Descuentos (en pesos)
    const valor_descuento_comercial = valor_base_plan * (descuento_comercial_pct / 100);
    const valor_descuento_afinidad = valor_base_plan * (descuento_afinidad_pct / 100);

    const subtotal = valor_base_plan - valor_descuento_comercial - valor_descuento_afinidad;

    // Lógica de Aportes/Impuestos 
    let valor_total = 0;
    let sueldo_bruto = 0;
    let valor_aportes_estimados = 0;
    let valor_aporte_monotributo = 0;
    let valor_iva = 0;

    switch (tipo_ingreso) {
        case TIPOS_INGRESO.OBLIGATORIO:
            sueldo_bruto = aporte_obra_social / 0.03;
            valor_aportes_estimados = sueldo_bruto * 0.09;
            valor_total = subtotal - valor_aportes_estimados;
            break;

        case TIPOS_INGRESO.MONOTRIBUTO:
            const aporteTitular = await monotributoModel.findAporteByCategoria(monotributo_categoria);
            const aporteAdherente = await monotributoModel.findAporteAdherente();

            valor_aporte_monotributo = aporteTitular + (aporteAdherente * (monotributo_adherentes || 0));
            valor_total = subtotal - valor_aporte_monotributo;
            break;

        case TIPOS_INGRESO.VOLUNTARIO:
        default:
            valor_iva = subtotal * 0.105;
            valor_total = subtotal + valor_iva;
            break;
    }

    // Devuelve el objeto COMPLETO, listo para guardar en la DB
    const cotizacionCalculada = {
        ...cotizacionData,
        valor_base_plan,
        valor_descuento_comercial,
        valor_descuento_afinidad,
        sueldo_bruto,
        valor_aportes_estimados,
        valor_aporte_monotributo,
        valor_iva,
        valor_total: valor_total < 0 ? 0 : valor_total // El valor no puede ser negativo
    };

    return { cotizacionCalculada, miembrosConPrecios };
};

module.exports = {
    calcularCotizacion,
};