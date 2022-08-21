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
    console.log(cliente);

    // Oculatar el modal
    // Como está hecho con bootstrap, tengo que acceder a sus métodos
    // obtengo una instancia del modal actual de bootstrap y le paso
    // el formulario que es donde tengo el modal
    const modalBootstrap = bootstrap.Modal.getInstance(formularioModal);
    // oculto el modal
    modalBootstrap.hide();

    // Muestra las secciones de platillos y resumen de consumo
    mostrarSecciones();

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