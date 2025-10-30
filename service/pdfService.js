//============================================================================
// SERVICIO DE GENERACIÓN DE PDFS PARA COTIZACIONES
//============================================================================
const PDFDocument = require('pdfkit');

// Funciones Auxiliares

function formatDate(date) {
    const d = new Date(date);
    const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return utcDate.toLocaleDateString('es-AR', { timeZone: 'UTC' });
}
function formatCurrency(number) {
    const numValue = parseFloat(number);
    if (isNaN(numValue)) {
        console.warn(`formatCurrency recibió un valor no numérico: ${number}`);
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(0);
    }
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(number);
}
function generarNumeroCotizacion(id, fecha) {
    const anio = new Date(fecha).getUTCFullYear();
    const idFormateado = String(id).padStart(6, '0');
    return `${anio}-${idFormateado}`;
}
function getFechaCaducidad(fechaCreacion) {
    const fecha = new Date(fechaCreacion);
    fecha.setUTCDate(fecha.getUTCDate() + 15);
    return formatDate(fecha);
}
function getFechaIngreso(fechaCreacion) {
    const fecha = new Date(fechaCreacion);
    const anio = fecha.getUTCFullYear();
    const mes = fecha.getUTCMonth();
    return formatDate(new Date(Date.UTC(anio, mes + 1, 1)));
}
function generarFilaTablaPrecios(doc, y, c1, c2) {
    const xStart = 50;
    const yLine = y + 15;
    doc.fontSize(10).font('Helvetica').text(c1, xStart, y);
    doc.fontSize(10).font('Helvetica').text(c2, xStart, y, {
        align: 'right'
    });
    doc.moveTo(xStart, yLine)
        .lineTo(doc.page.width - xStart, yLine)
        .strokeColor('#cccccc')
        .stroke();
}

// Función generarTablaPrestaciones 
function generarTablaPrestaciones(doc, titulo, texto) {
    const alturaMinimaRequerida = 80;
    if (doc.y + alturaMinimaRequerida > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
    }
    doc.fontSize(14).font('Helvetica-Bold').text(titulo, 50, doc.y, { underline: true });
    doc.moveDown(1.5);
    const tableTop = doc.y;
    const xPrestacion = 55;
    const xCobertura = 300;
    const xReintegro = 450;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('PRESTACIÓN', xPrestacion, tableTop);
    doc.text('COBERTURA', xCobertura, tableTop);
    doc.text('REINTEGRO', xReintegro, tableTop);
    doc.moveTo(50, doc.y + 5).lineTo(560, doc.y + 5).strokeColor('#333333').stroke();
    doc.moveDown(1.5);
    if (!texto) {
        doc.fontSize(9).font('Helvetica').text('No disponible.', xPrestacion, doc.y);
        return;
    }
    const lineas = texto.replace(/\n\n/g, '\n').split('\n');
    doc.font('Helvetica').fontSize(9);
    lineas.forEach((linea) => {
        if (linea.trim() === '') return;
        let prestacion = 'N/A', cobertura = 'N/A', reintegro = 'N/A';
        if (linea.includes('|')) {
            const partes = linea.split('|');
            prestacion = partes[0] ? partes[0].trim() : 'N/A';
            cobertura = partes[1] ? partes[1].trim() : 'N/A';
            reintegro = partes[2] ? partes[2].trim() : 'N/A';
        } else if (linea.includes(':')) {
            const partes = linea.split(':');
            prestacion = partes[0] ? partes[0].trim() : 'N/A';
            cobertura = partes[1] ? partes[1].trim() : 'N/A';
        } else { prestacion = linea.trim(); }
        const hPrestacion = doc.heightOfString(prestacion, { width: 240 });
        const hCobertura = doc.heightOfString(cobertura, { width: 140 });
        const hReintegro = doc.heightOfString(reintegro, { width: 100 });
        const alturaFila = Math.max(hPrestacion, hCobertura, hReintegro);
        if (doc.y + alturaFila > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
        }
        const y = doc.y;
        doc.text(prestacion, xPrestacion, y, { width: 240 });
        doc.text(cobertura, xCobertura, y, { width: 140 });
        doc.text(reintegro, xReintegro, y, { width: 100 });
        doc.y = y + alturaFila;
        doc.moveTo(50, doc.y + 3).lineTo(560, doc.y + 3).strokeColor('#EEEEEE').stroke();
        doc.moveDown(0.5);
    });
}

// Función generarBloqueTexto
function generarBloqueTexto(doc, titulo, texto) {
    // Verifica si hay espacio suficiente para el bloque
    const alturaMinimaRequerida = 50;
    if (doc.y + alturaMinimaRequerida > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
    }

    // Dibuja el título
    doc.fontSize(14).font('Helvetica-Bold').text(titulo, 50, doc.y, { underline: true });
    doc.moveDown(1.5);

    if (!texto) {
        doc.fontSize(9).font('Helvetica').text('No disponible.', 50, doc.y);
        return;
    }

    // Dibuja el texto libre, con wrapping y limpieza de saltos de línea
    const textoLimpio = texto.replace(/\n\n/g, '\n');

    doc.fontSize(9).font('Helvetica').text(textoLimpio, 50, doc.y, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right, // Ancho completo
        align: 'left'
    });
}

// --- Función Principal ---

function generarCotizacionPDF(data, res) {
    if (!data) throw new Error('No se proporcionaron datos (data) para generar el PDF.');
    if (!data.asesor) data.asesor = {};
    if (!data.cliente) data.cliente = {};
    if (!data.plan) data.plan = {};
    if (!data.miembros) data.miembros = [];

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Bloques 1 y 2 - Asesor, Cliente, Fechas
    doc.fontSize(16).font('Helvetica-Bold').text('SIGEC', 50, 50);
    doc.fontSize(12).font('Helvetica-Bold').text('Datos del Asesor', 50, 80);
    doc.moveDown(0.5);
    let yAsesor = doc.y;
    doc.fontSize(10).font('Helvetica').text(`Asesor: ${data.asesor.nombre || 'N/A'} ${data.asesor.apellido || ''}`, 50, yAsesor);
    doc.fontSize(10).font('Helvetica').text(`Email: ${data.asesor.email || 'N/A'}`, 50, yAsesor + 15);
    doc.fontSize(10).font('Helvetica').text(`Teléfono: ${data.asesor.telefono || 'N/A'}`, 50, yAsesor + 30);
    doc.y = yAsesor + 45; // Fin del bloque Asesor

    // Bloque N° Cotización (a la derecha)
    const cotizacionNum = generarNumeroCotizacion(data.id || 0, data.fecha_creacion || new Date());
    doc.fontSize(10).font('Helvetica').text('Cotización N°', 400, 80, { align: 'right' });
    doc.fontSize(14).font('Helvetica-Bold').text(cotizacionNum, 400, 95, { align: 'right' });

    // El cursor 'doc.y' sigue estando al final del bloque Asesor (aprox 145)

    // INICIO AJUSTE TÍTULO 

    doc.moveDown(3); // Espacio extra ANTES del título
    doc.fontSize(14).font('Helvetica-Bold').text('COTIZACIÓN DE PLAN', 50, doc.y);
    doc.moveDown(1); // Espacio DESPUÉS del título

    doc.fontSize(12).font('Helvetica-Bold').text('Datos del Cliente', 50, doc.y);
    doc.moveDown(0.5);
    let yCliente = doc.y;
    doc.fontSize(10).font('Helvetica').text(`Titular: ${data.cliente.nombres || 'N/A'} ${data.cliente.apellidos || ''}`, 50, yCliente);
    doc.fontSize(10).font('Helvetica').text(`DNI: ${data.cliente.dni || 'N/A'}`, 50, yCliente + 15);
    doc.fontSize(10).font('Helvetica').text(`Teléfono: ${data.cliente.telefono || 'N/A'}`, 50, yCliente + 30);
    doc.y = yCliente + 45;
    doc.moveDown(1.5);
    const yInfo = doc.y;
    const xLbl1 = 50;
    doc.fontSize(10).font('Helvetica').text('Fecha de creación', xLbl1, yInfo);
    doc.fontSize(10).font('Helvetica').text('Fecha de caducidad', xLbl1, yInfo + 15);
    doc.fontSize(10).font('Helvetica').text('Fecha de ingreso', xLbl1, yInfo + 30);
    const xVal1 = 150;
    const wVal1 = 100;
    doc.fontSize(10).font('Helvetica-Bold').text(formatDate(data.fecha_creacion || new Date()), xVal1, yInfo, { width: wVal1, align: 'right' });
    doc.fontSize(10).font('Helvetica-Bold').text(getFechaCaducidad(data.fecha_creacion || new Date()), xVal1, yInfo + 15, { width: wVal1, align: 'right' });
    doc.fontSize(10).font('Helvetica-Bold').text(getFechaIngreso(data.fecha_creacion || new Date()), xVal1, yInfo + 30, { width: wVal1, align: 'right' });
    const xLbl2 = 300;
    doc.fontSize(10).font('Helvetica').text('Plan del Grupo Familiar', xLbl2, yInfo);
    doc.fontSize(10).font('Helvetica').text('Categoría', xLbl2, yInfo + 15);
    doc.fontSize(10).font('Helvetica').text('Cantidad de cápitas', xLbl2, yInfo + 30);
    const xVal2 = 460;
    const wVal2 = 100;
    doc.fontSize(10).font('Helvetica-Bold').text(data.plan.nombre || '', xVal2, yInfo, { width: wVal2, align: 'right' });
    doc.fontSize(10).font('Helvetica-Bold').text(data.tipo_ingreso || '', xVal2, yInfo + 15, { width: wVal2, align: 'right' });
    doc.fontSize(10).font('Helvetica-Bold').text(data.miembros.length, xVal2, yInfo + 30, { width: wVal2, align: 'right' });
    doc.moveDown(2.5);

    // Bloque 3 - Detalle Cotización
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle de la Cotización', 50, doc.y, { underline: true });
    doc.moveDown(1);
    let y = doc.y;

    const vBase = parseFloat(data.valor_base_plan) || 0;
    const vComercial = parseFloat(data.valor_descuento_comercial) || 0;
    const vAfinidad = parseFloat(data.valor_descuento_afinidad) || 0;
    const vJoven = parseFloat(data.valor_descuento_joven) || 0;
    const vTarjeta = parseFloat(data.valor_descuento_tarjeta) || 0;
    const vAportes = parseFloat(data.valor_aportes_estimados) || 0;
    const vMono = parseFloat(data.valor_aporte_monotributo) || 0;
    const vIva = parseFloat(data.valor_iva) || 0;
    const vTotal = parseFloat(data.valor_total) || 0;
    const pComercial = parseFloat(data.descuento_comercial_pct) || 0;
    const pAfinidad = parseFloat(data.descuento_afinidad_pct) || 0;
    const pJoven = parseFloat(data.descuento_joven_pct) || 0;
    const pTarjeta = parseFloat(data.descuento_tarjeta_pct) || 0;

    generarFilaTablaPrecios(doc, y, 'Valor del Plan', formatCurrency(data.valor_base_plan || 0));
    y += 20;

    if (vComercial > 0) {
        generarFilaTablaPrecios(doc, y, `Dto. Comercial (${pComercial.toFixed(2)}%)`, formatCurrency(-vComercial));
        y += 20;
    }

    if (vAfinidad > 0) {
        generarFilaTablaPrecios(doc, y, `Dto. Afinidad (${pAfinidad.toFixed(2)}%)`, formatCurrency(-vAfinidad));
        y += 20;
    }

    if (vJoven > 0) {
        generarFilaTablaPrecios(doc, y, `Dto. Joven (${pJoven.toFixed(2)}%)`, formatCurrency(-vJoven));
        y += 20;
    }

    if (vTarjeta > 0) {
        generarFilaTablaPrecios(doc, y, `Dto. Tarjeta Crédito (${pTarjeta.toFixed(2)}%)`, formatCurrency(-vTarjeta));
        y += 20;
    }

    if (data.tipo_ingreso === 'Obligatorio' && vAportes > 0) {
        generarFilaTablaPrecios(doc, y, 'Aportes Estimados (OS)', formatCurrency(-(data.valor_aportes_estimados || 0)));
        y += 20;
    }
    if (data.tipo_ingreso === 'Monotributo' && vMono > 0) {
        generarFilaTablaPrecios(doc, y, 'Aporte Monotributo', formatCurrency(-(data.valor_aporte_monotributo || 0)));
        y += 20;
    }
    if (data.tipo_ingreso === 'Voluntario' && vIva > 0) {
        generarFilaTablaPrecios(doc, y, 'IVA (10.5%)', formatCurrency(data.valor_iva || 0));
        y += 20;
    }
    doc.moveDown(1);
    y = doc.y;
    const xStartTotal = 50;
    doc.fontSize(14).font('Helvetica-Bold').text(
        'Total a pagar', 300, y,
        { width: 150, align: 'right' }
    );
    doc.fontSize(14).font('Helvetica-Bold').text(
        formatCurrency(data.valor_total || 0), xStartTotal, y,
        { align: 'right' }
    );

    doc.addPage();


    // Dibujamos la primera tabla
    generarTablaPrestaciones(doc, 'Prestaciones del Plan', data.plan.detalles || 'No disponible.');

    // Dejamos espacio DESPUÉS de la primera tabla
    doc.moveDown(1);

    // Verifica si hay espacio para el TÍTULO de la segunda tabla
    const espacioMinimoTitulo = 50;
    if (doc.y + espacioMinimoTitulo > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
    }

    // Dibujamos la segunda tabla
    generarBloqueTexto(doc, 'Condiciones Generales', data.plan.condiciones_generales || 'No disponible.'); 
    // Finalizar el PDF
    doc.end();
}

module.exports = { generarCotizacionPDF };

