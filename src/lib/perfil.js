import { supabase } from './supabase';

export function validarDatosPerfil(datos) {
    const nombre = datos.name.trim();
    const email = datos.email.trim();
    const dni = datos.dni.trim();
    const telefono = datos.telefono.trim();
    const provincia = datos.provincia.trim();
    const direccion = datos.direccion.trim();
    const localidad = datos.localidad.trim();

    if (nombre === '' || email === '' || dni === '' || telefono === '' || provincia === '' || direccion === '' || localidad === '') {
        return { ok: false, error: 'Completá todos los campos.' };
    }

    if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
        return { ok: false, error: 'El email ingresado no es válido.' };
    }

    return {
        ok: true,
        datos: {
            name: nombre,
            email: email,
            dni: dni,
            telefono: telefono,
            provincia: provincia,
            direccion: direccion,
            localidad: localidad,
        },
    };
}

export async function actualizarPerfil(userId, datos) {
    return supabase
        .from('profiles')
        .update({
            name: datos.name,
            dni: datos.dni,
            telefono: datos.telefono,
            provincia: datos.provincia,
            direccion: datos.direccion,
            localidad: datos.localidad,
        })
        .eq('id', userId)
        .select('id, name, dni, telefono, provincia, direccion, localidad, rol, is_validado')
        .single();
}

export async function actualizarEmailUsuario(email) {
    return supabase.auth.updateUser({
        email: email,
    });
}
