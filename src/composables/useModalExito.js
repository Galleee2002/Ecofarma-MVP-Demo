import { ref } from 'vue';

const abierto = ref(false);
const titulo = ref('');
const detalle = ref('');

export function useModalExito() {
    function mostrar(tituloNuevo, detalleNuevo) {
        titulo.value = tituloNuevo;
        detalle.value = detalleNuevo || '';
        abierto.value = true;
    }

    function cerrar() {
        abierto.value = false;
    }

    return {
        abierto,
        titulo,
        detalle,
        mostrar,
        cerrar,
    };
}
