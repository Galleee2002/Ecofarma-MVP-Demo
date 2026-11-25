import { supabase } from './supabase';

export async function obtenerSolicitudChat(solicitudId) {
    return supabase
        .from('solicitudes')
        .select('id, estado, receptor_id, medicamentos(nombre_comercial, user_id)')
        .eq('id', solicitudId)
        .maybeSingle();
}

export async function listarParticipantesSolicitud(solicitudId) {
    return supabase.rpc('participantes_solicitud', {
        p_solicitud_id: solicitudId,
    });
}

export async function listarMensajesSolicitud(solicitudId) {
    return supabase
        .from('solicitud_mensajes')
        .select('id, solicitud_id, user_id, mensaje, created_at')
        .eq('solicitud_id', solicitudId)
        .order('created_at', { ascending: true });
}

export async function insertarMensajeSolicitud(solicitudId, userId, mensaje) {
    return supabase
        .from('solicitud_mensajes')
        .insert({
            solicitud_id: solicitudId,
            user_id: userId,
            mensaje: mensaje,
        })
        .select('id, solicitud_id, user_id, mensaje, created_at')
        .single();
}

export function suscribirMensajesSolicitud(solicitudId, alInsertar) {
    return supabase
        .channel('solicitud-mensajes:' + solicitudId)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'solicitud_mensajes',
                filter: 'solicitud_id=eq.' + solicitudId,
            },
            function (payload) {
                alInsertar(payload.new);
            },
        )
        .subscribe();
}

export function cancelarCanalMensajes(canal) {
    if (canal !== null) {
        supabase.removeChannel(canal);
    }
}
