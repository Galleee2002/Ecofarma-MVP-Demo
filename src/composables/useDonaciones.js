import { ref } from 'vue';
import {
    adjuntarSolicitudesActivas,
    listarMisDonaciones,
    publicarDonacionEnServidor,
    validarDonacion,
} from '../lib/donaciones';

export function useDonaciones() {
    const donaciones = ref([]);
    const cargando = ref(false);
    const cargado = ref(false);
    const error = ref('');
    const publicando = ref(false);
    const errorPublicar = ref('');
    const mensajePublicar = ref('');
    const tipoMensajePublicar = ref('exito');

    async function cargarMisDonaciones(userId) {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await listarMisDonaciones(userId);

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar tus donaciones. Intentá de nuevo en unos minutos.';
            donaciones.value = [];
        } else {
            await adjuntarSolicitudesActivas(data);
            donaciones.value = data;
        }

        cargando.value = false;
        cargado.value = true;
    }

    async function publicarDonacion(userId, datos, fotos) {
        errorPublicar.value = '';
        mensajePublicar.value = '';

        const errorValidacion = validarDonacion(datos, fotos);
        if (errorValidacion !== '') {
            errorPublicar.value = errorValidacion;
            return false;
        }

        publicando.value = true;

        const resultado = await publicarDonacionEnServidor(userId, datos, fotos);

        if (!resultado.ok) {
            errorPublicar.value = resultado.error;
            publicando.value = false;
            return false;
        }

        if (resultado.respuesta.estado === 'disponible') {
            tipoMensajePublicar.value = 'exito';
            mensajePublicar.value = 'Tu donación ya está publicada en el catálogo.';
        } else {
            tipoMensajePublicar.value = 'informativo';
            mensajePublicar.value =
                'Esta donación no coincide con el vademécum, así que no se publica en el catálogo. En este MVP solo aparecen medicamentos del vademécum.';
        }

        publicando.value = false;
        return true;
    }

    return {
        donaciones,
        cargando,
        cargado,
        error,
        publicando,
        errorPublicar,
        mensajePublicar,
        tipoMensajePublicar,
        cargarMisDonaciones,
        publicarDonacion,
    };
}
