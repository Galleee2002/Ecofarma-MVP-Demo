import { obtenerExtension } from './archivos';
import { leerMensajeDeError } from './erroresFuncion';
import { obtenerFechaDeHoy } from './fechas';
import { supabase } from './supabase';

const MAXIMO_FOTOS = 3;
const TAMANIO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_DE_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_FOTOS = 'fotos-envases';
const MENSAJE_ERROR_PUBLICAR = 'No pudimos publicar la donación. Intentá de nuevo en unos minutos.';

export function validarDonacion(datos, fotos) {
    const camposObligatorios = [
        datos.nombre_comercial,
        datos.principio_activo,
        datos.concentracion,
        datos.forma_farmaceutica,
        datos.lote,
        String(datos.cantidad_disponible),
        datos.fecha_vencimiento,
    ];

    for (const campo of camposObligatorios) {
        if (campo.trim() === '') {
            return 'Completá el nombre comercial, el principio activo, la concentración, la forma farmacéutica, el lote, la cantidad y la fecha de vencimiento.';
        }
    }

    const cantidad = Number(datos.cantidad_disponible);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        return 'La cantidad tiene que ser un número entero mayor o igual a 1.';
    }

    if (datos.fecha_vencimiento <= obtenerFechaDeHoy()) {
        return 'No se pueden donar medicamentos vencidos o que vencen hoy. Revisá la fecha de vencimiento.';
    }

    if (fotos.length === 0) {
        return 'Subí al menos una foto del envase.';
    }

    if (fotos.length > MAXIMO_FOTOS) {
        return 'Podés subir hasta 3 fotos del envase.';
    }

    const nombres = [];
    for (const foto of fotos) {
        if (!TIPOS_DE_FOTO.includes(foto.type)) {
            return 'Las fotos tienen que ser imágenes JPG, PNG o WEBP.';
        }
        if (foto.size > TAMANIO_MAXIMO_FOTO) {
            return 'Cada foto puede pesar como máximo 5 MB.';
        }
        if (nombres.includes(foto.name.toLowerCase())) {
            return 'No podés subir dos fotos con el mismo nombre.';
        }
        nombres.push(foto.name.toLowerCase());
    }

    return '';
}

async function borrarFotos(rutas) {
    if (rutas.length === 0) {
        return;
    }

    const { error: errorBorrar } = await supabase.storage.from(BUCKET_FOTOS).remove(rutas);
    if (errorBorrar) {
        console.error(errorBorrar);
    }
}

export async function adjuntarSolicitudesActivas(filas) {
    for (const donacion of filas) {
        donacion.solicitud_id = null;
    }

    const idsReservados = [];
    for (const donacion of filas) {
        if (donacion.estado === 'reservado') {
            idsReservados.push(donacion.id);
        }
    }

    if (idsReservados.length === 0) {
        return;
    }

    const { data, error: errorSolicitudes } = await supabase
        .from('solicitudes')
        .select('id, medicamento_id, estado')
        .in('medicamento_id', idsReservados)
        .in('estado', ['pendiente_coordinacion', 'en_camino']);

    if (errorSolicitudes) {
        console.error(errorSolicitudes);
        return;
    }

    for (const donacion of filas) {
        for (const solicitud of data) {
            if (solicitud.medicamento_id === donacion.id) {
                donacion.solicitud_id = solicitud.id;
            }
        }
    }
}

export async function listarMisDonaciones(userId) {
    return supabase
        .from('medicamentos')
        .select('id, nombre_comercial, principio_activo, concentracion, cantidad_disponible, fecha_vencimiento, estado, motivo_rechazo, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
}

export async function publicarDonacionEnServidor(userId, datos, fotos) {
    const errorValidacion = validarDonacion(datos, fotos);
    if (errorValidacion !== '') {
        return { ok: false, error: errorValidacion };
    }

    const rutas = [];
    const urls = [];
    const nombres = [];

    for (const foto of fotos) {
        const ruta = userId + '/' + crypto.randomUUID() + '.' + obtenerExtension(foto);

        const { error: errorSubida } = await supabase.storage.from(BUCKET_FOTOS).upload(ruta, foto);
        if (errorSubida) {
            console.error(errorSubida);
            await borrarFotos(rutas);
            return {
                ok: false,
                error: 'No pudimos subir las fotos del envase. Intentá de nuevo en unos minutos.',
            };
        }

        const { data: datosUrl } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta);
        rutas.push(ruta);
        urls.push(datosUrl.publicUrl);
        nombres.push(foto.name);
    }

    const { data: respuesta, error: errorFuncion } = await supabase.functions.invoke('publicar-medicamento', {
        body: {
            nombre_comercial: datos.nombre_comercial.trim(),
            principio_activo: datos.principio_activo.trim(),
            concentracion: datos.concentracion.trim(),
            forma_farmaceutica: datos.forma_farmaceutica.trim(),
            cantidad_disponible: Number(datos.cantidad_disponible),
            lote: datos.lote.trim(),
            fecha_vencimiento: datos.fecha_vencimiento,
            descripcion: datos.descripcion.trim(),
            fotos_envase: urls,
            nombres_fotos: nombres,
        },
    });

    if (errorFuncion) {
        const mensaje = await leerMensajeDeError(errorFuncion, MENSAJE_ERROR_PUBLICAR);
        await borrarFotos(rutas);
        return { ok: false, error: mensaje };
    }

    return { ok: true, respuesta };
}
