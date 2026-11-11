import { ref, onUnmounted } from 'vue';
import {
    cancelarCanalMensajes,
    insertarMensajeSolicitud,
    listarMensajesSolicitud,
    listarParticipantesSolicitud,
    obtenerSolicitudChat,
    suscribirMensajesSolicitud,
} from '../lib/mensajes';

export function useMensajes() {
    const mensajes = ref([]);
    const solicitud = ref(null);
    const nombreOtro = ref('');
    const cargando = ref(false);
    const enviando = ref(false);
    const error = ref('');
    const errorEnvio = ref('');
    let canal = null;

    function agregarMensaje(mensaje) {
        for (const item of mensajes.value) {
            if (String(item.id) === String(mensaje.id)) {
                return;
            }
        }
        mensajes.value.push(mensaje);
    }

    function dejarDeEscuchar() {
        cancelarCanalMensajes(canal);
        canal = null;
    }

    function escucharMensajes(solicitudId) {
        dejarDeEscuchar();
        canal = suscribirMensajesSolicitud(solicitudId, agregarMensaje);
    }

    async function cargarChat(solicitudId, userId) {
        cargando.value = true;
        error.value = '';
        errorEnvio.value = '';
        mensajes.value = [];
        solicitud.value = null;
        nombreOtro.value = '';
        dejarDeEscuchar();

        const { data: fila, error: errorSolicitud } = await obtenerSolicitudChat(solicitudId);

        if (errorSolicitud) {
            console.error(errorSolicitud);
            error.value = 'No pudimos abrir el chat. Intentá de nuevo en unos minutos.';
            cargando.value = false;
            return;
        }

        if (fila === null) {
            error.value = 'No encontramos esta conversación.';
            cargando.value = false;
            return;
        }

        solicitud.value = fila;

        const { data: participantes, error: errorParticipantes } = await listarParticipantesSolicitud(solicitudId);

        if (errorParticipantes || participantes === null) {
            if (errorParticipantes) {
                console.error(errorParticipantes);
            }
        } else {
            for (const participante of participantes) {
                if (participante.id !== userId) {
                    nombreOtro.value = participante.name;
                }
            }
        }

        const { data: filas, error: errorMensajes } = await listarMensajesSolicitud(solicitudId);

        if (errorMensajes) {
            console.error(errorMensajes);
            error.value = 'No pudimos cargar los mensajes. Intentá de nuevo en unos minutos.';
            cargando.value = false;
            return;
        }

        mensajes.value = filas;
        escucharMensajes(solicitudId);
        cargando.value = false;
    }

    async function enviarMensaje(solicitudId, userId, texto) {
        errorEnvio.value = '';
        const mensaje = texto.trim();
        if (mensaje === '') {
            return false;
        }

        enviando.value = true;

        const { data, error: errorInsert } = await insertarMensajeSolicitud(solicitudId, userId, mensaje);

        enviando.value = false;

        if (errorInsert) {
            console.error(errorInsert);
            errorEnvio.value = 'No pudimos enviar el mensaje. Intentá de nuevo en unos minutos.';
            return false;
        }

        agregarMensaje(data);
        return true;
    }

    onUnmounted(function () {
        dejarDeEscuchar();
    });

    return {
        mensajes,
        solicitud,
        nombreOtro,
        cargando,
        enviando,
        error,
        errorEnvio,
        cargarChat,
        enviarMensaje,
    };
}
