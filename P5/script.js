// 1. Referencias a los elementos principales del DOM
const form = document.getElementById('form-reserva');
const cajaErrores = document.getElementById('caja-errores');
const divResumen = document.getElementById('resumen');
const divPrecioEstimado = document.getElementById('precio-estimado');

// 2. Reglas de negocio (Tarifas)
const tarifasHabitacion = {
    individual: 50,
    doble: 80,
    suite: 120
};
const tarifaDesayuno = 10;
const tarifaParking = 15;

// 3. Función auxiliar: Calcular número de noches
function calcularNoches(fechaEntrada, fechaSalida) {
    if (!fechaEntrada || !fechaSalida) return 0;
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    
    // Si la salida es igual o anterior a la entrada, no hay noches válidas
    if (salida <= entrada) return 0;

    const diferenciaMs = salida - entrada;
    const noches = Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
    return noches;
}

// 4. Función auxiliar: Calcular precio total
function calcularPrecioTotal(noches) {
    const habitacion = document.getElementById('habitacion').value;
    const huespedes = parseInt(document.getElementById('clientes').value) || 1;
    const quiereDesayuno = document.getElementById('desayuno').checked;
    const quiereParking = document.getElementById('parking').checked;
    const codigoDescuento = document.getElementById('descuento').value.trim().toUpperCase();

    // Coste base de la habitación
    let total = tarifasHabitacion[habitacion] * noches;

    // Coste de extras (El desayuno se multiplica por el número de huéspedes)
    if (quiereDesayuno) {
        total += tarifaDesayuno * huespedes * noches;
    }
    if (quiereParking) {
        total += tarifaParking * noches;
    }

    // Aplicar descuento PROMO10 (10%)
    let descuentoAplicado = 0;
    if (codigoDescuento === 'PROMO10') {
        descuentoAplicado = total * 0.10;
        total -= descuentoAplicado;
    }

    return { total, descuentoAplicado };
}

// 5. Actualizar precio estimado en vivo al interactuar con el formulario
form.addEventListener('input', function() {
    const entrada = document.getElementById('fecha_inicio').value;
    const salida = document.getElementById('fecha_fin').value;
    
    let noches = calcularNoches(entrada, salida);
    // Si aún no hay fechas válidas, estimamos por 1 noche para que el usuario vea la tarifa base
    if (noches === 0) noches = 1; 

    const calculo = calcularPrecioTotal(noches);
    // Actualizamos el HTML del cartel azul
    divPrecioEstimado.innerHTML = `<strong>Precio estimado: ${calculo.total.toFixed(2)} €</strong> <small>(basado en ${noches} noche/s)</small>`;
});

// 6. EVENTO PRINCIPAL: Validar y procesar al hacer clic en "Reservar"
form.addEventListener('submit', function(evento) {
    evento.preventDefault(); // Evitamos que la página se recargue

    // Ocultar errores y resumen de intentos anteriores
    cajaErrores.style.display = 'none';
    cajaErrores.innerHTML = '';
    divResumen.style.display = 'none';
    divResumen.innerHTML = '';

    // Recoger valores de los campos
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const entrada = document.getElementById('fecha_inicio').value;
    const salida = document.getElementById('fecha_fin').value;
    const habitacion = document.getElementById('habitacion').value;
    // Convertimos a número para poder hacer la validación matemática
    const huespedes = parseInt(document.getElementById('clientes').value) || 1;

    let errores = [];

    // Validaciones de campos vacíos
    if (nombre === '') errores.push('El nombre completo es obligatorio.');
    
    if (email === '') {
        errores.push('El correo electrónico es obligatorio.');
    } else if (email.indexOf('@') === -1) {
        errores.push('El correo electrónico debe contener un "@".');
    }

    if (entrada === '') errores.push('La fecha de llegada es obligatoria.');
    if (salida === '') errores.push('La fecha de salida es obligatoria.');

    // Validaciones de fechas
    let noches = calcularNoches(entrada, salida);
    if (entrada !== '' && salida !== '' && noches === 0) {
        errores.push('La fecha de salida debe ser posterior a la de llegada.');
    }

    // Mostrar errores si los hay y detener la ejecución
    if (errores.length > 0) {
        cajaErrores.style.display = 'block'; // Mostrar la caja roja
        
        const ul = document.createElement('ul');
        ul.style.marginBottom = '0';
        for (let i = 0; i < errores.length; i++) {
            const li = document.createElement('li');
            li.textContent = errores[i];
            ul.appendChild(li);
        }
        cajaErrores.appendChild(ul);
        
        return; 
    }

    // Si todo está bien, calculamos precio final y mostramos el resumen
    const calculoFinal = calcularPrecioTotal(noches);
    crearResumen(nombre, email, entrada, salida, noches, habitacion, huespedes, calculoFinal);
});

// 7. EVENTO LIMPIAR: Al pulsar el botón "Limpiar", ocultamos mensajes
form.addEventListener('reset', function() {
    cajaErrores.style.display = 'none';
    divResumen.style.display = 'none';
    divPrecioEstimado.innerHTML = '<strong>Precio estimado: 0.00 €</strong>';
});

// 8. Crear el bloque del resumen usando createElement y appendChild
function crearResumen(nombre, email, entrada, salida, noches, habitacion, huespedes, calculo) {
    divResumen.style.display = 'block';

    const titulo = document.createElement('h3');
    titulo.className = 'h5 text-success fw-bold border-bottom pb-2';
    titulo.textContent = '¡Reserva confirmada con éxito!';
    divResumen.appendChild(titulo);

    const lista = document.createElement('ul');
    lista.className = 'list-unstyled mt-3';

    const datos = [
        `Cliente: ${nombre} (${email})`,
        `Fechas: ${entrada} al ${salida} (${noches} noches)`,
        `Habitación: ${habitacion.toUpperCase()} (para ${huespedes} pasajero/s)`,
        `Descuento PROMO10: ${calculo.descuentoAplicado > 0 ? 'Aplicado (-' + calculo.descuentoAplicado.toFixed(2) + ' €)' : 'No aplicado'}`
    ];

    for (let i = 0; i < datos.length; i++) {
        const li = document.createElement('li');
        li.className = 'mb-2';
        li.textContent = datos[i];
        lista.appendChild(li);
    }
    divResumen.appendChild(lista);

    const precioFinal = document.createElement('div');
    precioFinal.className = 'alert alert-success mt-3 text-center fs-5 mb-0';
    precioFinal.innerHTML = `<strong>Total a pagar: ${calculo.total.toFixed(2)} €</strong>`;
    divResumen.appendChild(precioFinal);
}