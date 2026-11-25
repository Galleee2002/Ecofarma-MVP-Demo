import { ref } from 'vue';
import {
    cancelarSolicitudEnServidor,
    confirmarEntregaEnServidor,
    crearSolicitudEnServidor,
    listarMisSolicitudes,
    obtenerCodigoConfirmacion,
    validarSolicitud,
} from '../lib/solicitudes';

export function useSolicitudes() {
    const solicitudes = ref([]);
    const cargando = ref(false);
    const cargado = ref(false);
    const error = ref('');
    const creando = ref(false);
    const errorCrear = ref('');
    const mensajeCrear = ref('');
    const tipoMensajeCrear = ref('exito');
    const confirmando = ref(false);
    const errorConfirmar = ref('');
    const mensajeConfirmar = ref('');
    const cancelando = ref(false);
    const errorCancelar = ref('');
    const mensajeCancelar = ref('');

    async function obtenerCodigo(solicitud) {
        solicitud.codigo = null;
        solicitud.errorCodigo = false;

        if (solicitud.estado !== 'pendiente_coordinacion' && solicitud.estado !== 'en_camino') {
            return;
        }

        const { data, error: errorCodigo } = await obtenerCodigoConfirmacion(solicitud.id);

        if (errorCodigo || data === null) {
            console.error(errorCodigo);
            solicitud.errorCodigo = true;
        } else {
            solicitud.codigo = data;
        }
    }

    async function cargarMisSolicitudes(userId) {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await listarMisSolicitudes(userId);

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar tus solicitudes. Intentá de nuevo en unos minutos.';
            solicitudes.value = [];
        } else {
            for (const solicitud of data) {
                await obtenerCodigo(solicitud);
            }
            solicitudes.value = data;
        }

        cargando.value = false;
        cargado.value = true;
    }

    async function crearSolicitud(userId, datos, archivoReceta) {
        errorCrear.value = '';
        mensajeCrear.value = '';

        const errorValidacion = validarSolicitud(datos, archivoReceta);
        if (errorValidacion !== '') {
            errorCrear.value = errorValidacion;
            return false;
        }

        creando.value = true;

        const resultado = await crearSolicitudEnServidor(userId, datos, archivoReceta);

        if (!resultado.ok) {
            errorCrear.value = resultado.error;
            creando.value = false;
            return false;
        }

        tipoMensajeCrear.value = 'exito';
        mensajeCrear.value = 'Tu solicitud quedó registrada. El código de retiro lo vas a ver en Mis solicitudes, dentro de tu perfil.';
        creando.value = false;
        return true;
    }

    async function confirmarEntrega(solicitudId, codigo) {
        errorConfirmar.value = '';
        mensajeConfirmar.value = '';

        const codigoLimpio = codigo.trim();
        if (!/^[0-9]{6}$/.test(codigoLimpio)) {
            errorConfirmar.value = 'El código tiene que tener 6 dígitos.';
            return false;
        }

        confirmando.value = true;

        const resultado = await confirmarEntregaEnServidor(solicitudId, codigo);

        confirmando.value = false;

        if (!resultado.ok) {
            errorConfirmar.value = resultado.error;
            return false;
        }

        mensajeConfirmar.value = 'Entrega confirmada. El medicamento quedó registrado como entregado.';
        return true;
    }

    async function cancelarSolicitud(solicitudId) {
        errorCancelar.value = '';
        mensajeCancelar.value = '';
        cancelando.value = true;

        const resultado = await cancelarSolicitudEnServidor(solicitudId);

        cancelando.value = false;

        if (!resultado.ok) {
            errorCancelar.value = resultado.error;
            return false;
        }

        mensajeCancelar.value = 'Solicitud cancelada. El medicamento volvió a estar disponible.';
        return true;
    }

    return {
        solicitudes,
        cargando,
        cargado,
        error,
        creando,
        errorCrear,
        mensajeCrear,
        tipoMensajeCrear,
        confirmando,
        errorConfirmar,
        mensajeConfirmar,
        cancelando,
        errorCancelar,
        mensajeCancelar,
        cargarMisSolicitudes,
        crearSolicitud,
        confirmarEntrega,
        cancelarSolicitud,
    };
}
