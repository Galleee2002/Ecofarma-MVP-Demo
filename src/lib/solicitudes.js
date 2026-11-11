import { obtenerExtension } from './archivos';
import { leerMensajeDeError } from './erroresFuncion';
import { supabase } from './supabase';

const TAMANIO_MAXIMO_RECETA = 5 * 1024 * 1024;
const TIPOS_DE_RECETA = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_RECETAS = 'recetas-medicas';
const MENSAJE_ERROR_CREAR = 'No pudimos crear la solicitud. Intentá de nuevo en unos minutos.';
const MENSAJE_ERROR_CONFIRMAR = 'No pudimos confirmar la entrega. Intentá de nuevo en unos minutos.';
const MENSAJE_ERROR_CANCELAR = 'No pudimos cancelar la solicitud. Intentá de nuevo en unos minutos.';

export function validarSolicitud(datos, archivoReceta) {
    if (datos.aceptoDdjj !== true) {
        return 'Tenés que aceptar la Declaración Jurada para solicitar el medicamento.';
    }

    if (datos.esParaTercero === true && datos.nombreDestinatario.trim() === '') {
        return 'Indicá el nombre de la persona para quien pedís el medicamento.';
    }

    if (datos.requiereReceta === true) {
        if (archivoReceta === null) {
            return 'Este medicamento requiere la foto de una receta médica.';
        }
        if (!TIPOS_DE_RECETA.includes(archivoReceta.type)) {
            return 'La receta tiene que ser una imagen JPG, PNG o WEBP.';
        }
        if (archivoReceta.size > TAMANIO_MAXIMO_RECETA) {
            return 'La foto de la receta puede pesar como máximo 5 MB.';
        }
    }

    return '';
}

async function borrarReceta(ruta) {
    if (ruta === '') {
        return;
    }

    const { error: errorBorrar } = await supabase.storage.from(BUCKET_RECETAS).remove([ruta]);
    if (errorBorrar) {
        console.error(errorBorrar);
    }
}

export async function obtenerCodigoConfirmacion(solicitudId) {
    return supabase.rpc('obtener_codigo_confirmacion', {
        p_solicitud_id: solicitudId,
    });
}

export async function listarMisSolicitudes(userId) {
    return supabase
        .from('solicitudes')
        .select('id, estado, created_at, fecha_entrega, es_para_tercero, nombre_destinatario_final, medicamentos(nombre_comercial, principio_activo)')
        .eq('receptor_id', userId)
        .order('created_at', { ascending: false });
}

export async function crearSolicitudEnServidor(userId, datos, archivoReceta) {
    const errorValidacion = validarSolicitud(datos, archivoReceta);
    if (errorValidacion !== '') {
        return { ok: false, error: errorValidacion };
    }

    let rutaReceta = '';
    let urlReceta = '';

    if (archivoReceta !== null) {
        rutaReceta = userId + '/' + crypto.randomUUID() + '.' + obtenerExtension(archivoReceta);

        const { error: errorSubida } = await supabase.storage.from(BUCKET_RECETAS).upload(rutaReceta, archivoReceta);
        if (errorSubida) {
            console.error(errorSubida);
            return {
                ok: false,
                error: 'No pudimos subir la foto de la receta. Intentá de nuevo en unos minutos.',
            };
        }

        const { data: datosUrl } = supabase.storage.from(BUCKET_RECETAS).getPublicUrl(rutaReceta);
        urlReceta = datosUrl.publicUrl;
    }

    const { data: respuesta, error: errorFuncion } = await supabase.functions.invoke('crear-solicitud', {
        body: {
            medicamento_id: datos.medicamentoId,
            acepto_ddjj_receptor: true,
            es_para_tercero: datos.esParaTercero === true,
            nombre_destinatario_final: datos.esParaTercero === true ? datos.nombreDestinatario.trim() : '',
            receta_medica_url: urlReceta,
        },
    });

    if (errorFuncion) {
        const mensaje = await leerMensajeDeError(errorFuncion, MENSAJE_ERROR_CREAR);
        await borrarReceta(rutaReceta);
        return { ok: false, error: mensaje };
    }

    if (!respuesta || !respuesta.id) {
        await borrarReceta(rutaReceta);
        return { ok: false, error: MENSAJE_ERROR_CREAR };
    }

    return { ok: true, respuesta };
}

export async function confirmarEntregaEnServidor(solicitudId, codigo) {
    const codigoLimpio = codigo.trim();
    if (!/^[0-9]{6}$/.test(codigoLimpio)) {
        return { ok: false, error: 'El código tiene que tener 6 dígitos.' };
    }

    const { data: respuesta, error: errorFuncion } = await supabase.functions.invoke('confirmar-entrega', {
        body: {
            solicitud_id: solicitudId,
            codigo: codigoLimpio,
        },
    });

    if (errorFuncion) {
        const mensaje = await leerMensajeDeError(errorFuncion, MENSAJE_ERROR_CONFIRMAR);
        return { ok: false, error: mensaje };
    }

    if (!respuesta || respuesta.ok !== true) {
        return { ok: false, error: MENSAJE_ERROR_CONFIRMAR };
    }

    return { ok: true };
}

export async function cancelarSolicitudEnServidor(solicitudId) {
    const { data: respuesta, error: errorFuncion } = await supabase.functions.invoke('cancelar-solicitud', {
        body: {
            solicitud_id: solicitudId,
        },
    });

    if (errorFuncion) {
        const mensaje = await leerMensajeDeError(errorFuncion, MENSAJE_ERROR_CANCELAR);
        return { ok: false, error: mensaje };
    }

    if (!respuesta || respuesta.ok !== true) {
        return { ok: false, error: MENSAJE_ERROR_CANCELAR };
    }

    return { ok: true };
}
