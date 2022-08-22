// Variables del formulario modal
const mesaInput = document.querySelector('#mesa');
const horaInput = document.querySelector('#hora');
const formularioModal = document.querySelector('#formulario');
const guardarClienteBtn = document.querySelector('#guardar-cliente');

// Variable objeto para almacenar el pedido
let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

// Objeto de categorias
const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

guardarClienteBtn.addEventListener('click', guardarCliente);

function guardarCliente() {
    // console.log('Desde guardar Cliente');
    const mesa = mesaInput.value;
    const hora = horaInput.value;

    const camposVacios = [mesa, hora].some(campo => campo === '');

    // Validar si los campos están vacíos
    if (camposVacios) {
        // verificar si existe alerta
        const existeAlerta= document.querySelector('.invalid-feedback');

        if (!existeAlerta) {
            mostrarAlerta('Todos los campos son obligatorios');
        }

        return;     
    }

    // console.log('Todos los campos están llenos');

    // Lleno el objeto de cliente utilizando spreadOperator con una copia
    cliente = {...cliente, mesa, hora};
    // console.log(cliente);

    // Oculatar el modal
    // Como está hecho con bootstrap, tengo que acceder a sus métodos
    // obtengo una instancia del modal actual de bootstrap y le paso
    // el formulario que es donde tengo el modal
    const modalBootstrap = bootstrap.Modal.getInstance(formularioModal);
    // oculto el modal
    modalBootstrap.hide();

    // Muestra las secciones de platillos y resumen de consumo
    mostrarSecciones();

    // Obtener platillos de la api de Json Server
    obtenerPlatillos();

}
// Fin guardarCliente

function mostrarAlerta(mensaje) {
    const alertaDiv = document.createElement('div');
    alertaDiv.classList.add('invalid-feedback', 'd-block', 'text-center');
    alertaDiv.textContent = mensaje;
    document.querySelector('.modal-body form').appendChild(alertaDiv);
    setTimeout(() => {
        alertaDiv.remove();
    }, 3000);

}
// Fin mostrarAlerta

function mostrarSecciones() {
    // Selecciono las secciones ocultas
    const seccionesOcultas = document.querySelectorAll('.d-none');
    // Como obtengo un array, lo recorro y quito la clase d-none
    seccionesOcultas.forEach(seccion => {
        seccion.classList.remove('d-none');
    });
}
// Fin mostrarSecciones

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado =>{
            // console.log(resultado);
            mostrarPlatillos(resultado);
        })
        .catch(error => {
            console.log(error);
        })
}
// Fin obtenerPlatillos

function mostrarPlatillos(platillos) {
    // console.log(platillos);
    // Selecciono el div de contenido
    const contenidoDiv = document.querySelector('#platillos .contenido');

    // Recorro el arreglo de platillos
    platillos.forEach(platillo => {
        
        const row = document.createElement('div');
        // Agrego la clase row de bootstrap
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('div');
        // agrego clases de bootstrap col-md-4
        nombre.classList.add('col-md-4')
        // Asigno valor al nombre
        nombre.textContent = platillo.nombre;

        // Construyo div para el precio
        const precio = document.createElement('div');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        // construyo div para la categoria
        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        /**Utilizo el objeto categorias y le paso en el 
         * corchete el value de platillo.categoria para
         * asignarles valor
         */
        categoria.textContent = categorias[platillo.categoria];

        /**Construyo un input para la cantidad de alimentos
         * que el usuario va a consumir con su type,min,id
         * y classlist form-control y su value en 0
         */
        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        /**Función que detecta la cantidad y el platillo
         * que se está agregando, lo hago primero con
         * una función lineal, para que no me llame
         * en automático todos los ids y sólo detecte
         * el input donde hice el cambio
         */
        inputCantidad.onchange = function (){
            const cantidad = parseInt(inputCantidad.value);
            // Le paso un objeto de platillo
            agregarPlatillo({...platillo, cantidad});
        };

        // Creo un div para agregar el input y meterlo
        // en la grid de bootstrap
        const agregar = document.createElement('div');
        agregar.classList.add('col-md-2');
        // agrego el boton al div
        agregar.appendChild(inputCantidad)

        // Agrego el nombre, el precio a la fila
        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        // Agrego la fila al contenido
        contenidoDiv.appendChild(row);
    });

}
// Fin mostrarPlatillos

function agregarPlatillo(producto) {
    // console.log(producto);

    // Extraer el pedido actual del objeto cliente
    let {pedido} = cliente;

    // Revisar que la cantidad sea mayor a 0
    if (producto.cantidad > 0) {
        // console.log('Si es mayor a 0');

        // Verifico si un producto ya está en el pedido que
        // es un array
        if (pedido.some(articulo => articulo.id === producto.id)) {
            /**El artículo ya existe. Hay que actualizar la
             * cantidad. Creo una nueva variable para almacenar
             * un map que me permita actualizar la cantidad
             */
            const pedidoActualizado = pedido.map(articulo => {
                // Identifico el artículo que sea el mismo
                if (articulo.id === producto.id) {
                    // Actualizo la cantidad
                    articulo.cantidad = producto.cantidad;
                }
                // Asigno el nuevo artículo
                return articulo
            });
            // Se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado];

        }else{
            // El artículo no existe, Le paso una copia y le agrego el nuevo producto
            cliente.pedido = [...pedido, producto];

        }
        
    } else {
        // console.log('No es mayor a 0');
        /**Eliminar elementos cuando la cantidad es 0. Utilizamos
         * filter, que nos permite sacar elementos de un arreglo
         */
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);
        // console.log(resultado);
        // Asigno copia del resultado a cliente.pedido
        cliente.pedido = [...resultado];

    }

    // console.log(cliente.pedido);

    // Limpiar el código HTML previo
    limpiarHTML();

    // Si el array del pedido de cliente tiene algo
    if (cliente.pedido.length) {
        // Mostrar el resumen
        actualizarResumen()
    }else{
        // Si el array del pedido no tiene nada
        mensajePedidoVacio();
    }
    
}
// Fin agregarPlatillo

function actualizarResumen() {
    // console.log('Desde actualizar resumen');

    // Selecciono el div con la clase contenido que está en la sección resumen
    const contenido = document.querySelector('#resumen .contenido');

    // Creo div para el resumen
    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    // Información de la mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    // Agrego el span al párrafo de mesa
    mesa.appendChild(mesaSpan);

    // Información de la mesa
    const hora = document.createElement('p');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    // Agrego el span al párrafo de hora
    hora.appendChild(horaSpan);

    // Título de la sección
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4', 'text-center');

    // iterar sobre el array de pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const {pedido} = cliente;

    pedido.forEach(articulo => {
        // console.log(articulo);
        const {nombre, cantidad, id, precio} = articulo;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        // Creamos el nombre del producto que selecciono el usuario
        const nombreProducto = document.createElement('h4');
        nombreProducto.classList.add('my-4');
        nombreProducto.textContent = nombre;

        // Cantidad de producto
        const cantidadLabel = document.createElement('p');
        cantidadLabel.classList.add('fw-bold');
        cantidadLabel.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // Precio de producto
        const precioLabel = document.createElement('p');
        precioLabel.classList.add('fw-bold');
        precioLabel.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        // Sub-Total del producto
        const subTotalLabel = document.createElement('p');
        subTotalLabel.classList.add('fw-bold');
        subTotalLabel.textContent = 'Sub-Total platillo: ';

        const subTotalValor = document.createElement('span');
        subTotalValor.classList.add('fw-normal');
        subTotalValor.textContent = calcularSubtotal(precio, cantidad);

        // Botón para eliminar
        const eliminarBtn = document.createElement('button');
        eliminarBtn.classList.add('btn', 'btn-danger');
        eliminarBtn.textContent = 'Eliminar del pedido';

        // Función para eliminar del pedido
        eliminarBtn.onclick = function (){
            eliminarProducto(id);
        };

        // Agregar valores a sus contenedores
        cantidadLabel.appendChild(cantidadValor);
        precioLabel.appendChild(precioValor);
        subTotalLabel.appendChild(subTotalValor);


        // Agregar elementos al li
        lista.appendChild(nombreProducto);
        lista.appendChild(cantidadLabel);
        lista.appendChild(precioLabel);
        lista.appendChild(subTotalLabel);
        lista.appendChild(eliminarBtn);

        // Agregar elementos al ul
        grupo.appendChild(lista);
    });

    // Agrego la mesa, la hora, el heading y el grupo de ul al resumen
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    // Agrego el resumen al contenido
    contenido.appendChild(resumen);

    // Mostrar formulario de propinas
    formularioPropinas();

}
// Fin actualizarResumen

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}
// Fin limpiarHTML

function calcularSubtotal(precio, cantidad) {
    return `$ ${precio * cantidad}`;
}
// calcularSubtotal

function eliminarProducto(id) {
    // console.log('Eliminando...', id);
    const {pedido} = cliente;
    const resultado = pedido.filter(articulo => articulo.id !== id);
        // console.log(resultado);
        // Asigno copia del resultado a cliente.pedido
        cliente.pedido = [...resultado];
        // console.log(cliente.pedido);

        // Limpiamos el html previo
        limpiarHTML();

        if (cliente.pedido.length) {
            // Mostramos nuevamente el pedido actualizado
            actualizarResumen();
        } else {
            mensajePedidoVacio();
        }

        // El producto se eliminó por lo tanto regresamos la cantidad a 0 en el formulario
        const productoEliminado = `#producto-${id}`;
        // console.log(productoEliminado);
        const inputEliminado = document.querySelector(productoEliminado);
        inputEliminado.value= 0;
}
// Fin eliminarProducto

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');
    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
}
// Fin mensajePedidoVacio

function formularioPropinas() {
    // console.log('Mostrando formulario propinas');

    // Seleccionamos el contenido
    const contenido = document.querySelector('#resumen .contenido');

    // Creamos un div para el formulario
    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    // Creamos un div para que contenga el heading
    const divFormulario = document.createElement('div');
    divFormulario.classList.add('card', 'py-2', 'px-3','shadow');

    // Creamos el heading
    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    // Creación de radioButtons
    // 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;
    // label 10%
    const radio10label = document.createElement('label');
    radio10label.id = 'propina10';
    radio10label.name = 'propina10';
    radio10label.textContent = '10%';
    radio10label.classList.add('form-check-label');
    // div para contener el radio y el label
    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');
    // Agrego el radio y el label al div
    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10label);

    // 25%
    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;
    // label 25%
    const radio25label = document.createElement('label');
    radio25label.id = 'propina25';
    radio25label.name = 'propina25';
    radio25label.textContent = '25%';
    radio25label.classList.add('form-check-label');
    // div para contener el radio y el label
    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check');
    // Agrego el radio y el label al div
    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25label);

    // 50%
    const radio50 = document.createElement('input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;
    // label 50%
    const radio50label = document.createElement('label');
    radio50label.id = 'propina50';
    radio50label.name = 'propina50';
    radio50label.textContent = '50%';
    radio50label.classList.add('form-check-label');
    // div para contener el radio y el label
    const radio50Div = document.createElement('div');
    radio50Div.classList.add('form-check');
    // Agrego el radio y el label al div
    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50label);

    // Agregamos al div formulario el heading, los radios
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);
    
    // Agregamos el divFormulario al formulario
    formulario.appendChild(divFormulario);
    

    // Agregamos todo el contenido del formulario
    contenido.appendChild(formulario);

}
// Fin formularioPropinas

function calcularPropina() {
    // console.log('Desde calcular propina');

    // Traigo el objeto cliente y extraigo su pedido
    const {pedido} = cliente;
    // Variable que almacena el subtotal de la cuenta
    let subtotal = 0;

    // Iteramos sobre el pedido array para calcular el subtotal a pagar
    pedido.forEach(articulo => {
        // Aumentamos el subtotal en cada iteración
        subtotal+= articulo.cantidad * articulo.precio;
    });

    // console.log(subtotal);

    // Selecciono los inputs en base a su atributo name=propina para obtener el % de propina
    const propinaSeleccionada =document.querySelector('[name="propina"]:checked').value;
    // console.log(propinaSeleccionada);

    // Calcular la propina
    const propina = ((subtotal * parseInt(propinaSeleccionada))/ 100);
    // console.log(propina);

    // Calcular el total a pagar
    const total = subtotal + propina;
    // console.log(total);

    mostrarTotalHTML(subtotal,total, propina);
}
// Fin calcularPropina

function mostrarTotalHTML(subtotal,total, propina) {
    // console.log('Desde mostrar Total html');

    
    // Div con toda la información de los totales
    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar', 'my-5');

    // Creamos parrafo para el subtotal
    const subTotalParrafo = document.createElement('p');
    subTotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subTotalParrafo.textContent = 'Subtotal consumo: ';
    // Creamos el span del subtotal
    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$ ${subtotal}`;

    // Agregamos el span al parrafo
    subTotalParrafo.appendChild(subtotalSpan);

    // Creamos parrafo para la propina
    const propinaParrafo = document.createElement('p');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: ';
    // Creamos el span de la propina
    const propinaSpan = document.createElement('span');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$ ${propina}`;

    // Agregamos el span al parrafo
    propinaParrafo.appendChild(propinaSpan);

    // Creamos parrafo para el total
    const totalParrafo = document.createElement('p');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Propina: ';

    // Creamos el span de el total
    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$ ${total}`;

    // Agregamos el span al parrafo
    totalParrafo.appendChild(totalSpan);

    // Eliminar el último resultado
    const totalPagarDiv = document.querySelector('.total-pagar');
    if (totalPagarDiv) {
        totalPagarDiv.remove();
    }

    // Agregamos los párrafos al divTotales
    divTotales.appendChild(subTotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    // Agregamos al primer div del formulario que creamos con las propinas
    const formulario = document.querySelector('.formulario > div');

    formulario.appendChild(divTotales);

}
// Fin mostrarTotalHTML