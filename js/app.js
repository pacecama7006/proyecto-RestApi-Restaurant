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