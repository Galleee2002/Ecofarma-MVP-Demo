import { supabase } from './supabase';

export function traducirError(errorAuth, mensajePorDefecto) {
    console.error(errorAuth);

    if (errorAuth.code === 'invalid_credentials') {
        return 'El email o la contraseña no son correctos.';
    }
    if (errorAuth.code === 'user_already_exists' || errorAuth.code === 'email_exists') {
        return 'Ya existe una cuenta con ese email.';
    }
    if (errorAuth.code === 'weak_password') {
        return 'La contraseña es muy débil. Usá al menos 6 caracteres.';
    }
    if (errorAuth.code === 'email_address_invalid') {
        return 'El email ingresado no es válido.';
    }
    if (errorAuth.code === 'over_request_rate_limit') {
        return 'Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.';
    }
    if (errorAuth.code === 'unexpected_failure') {
        return 'No pudimos crear la cuenta. Verificá que el DNI no esté registrado.';
    }
    if (errorAuth.status === 0) {
        return 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';
    }

    return mensajePorDefecto;
}

export function validarRegistro(datos) {
    const camposObligatorios = [
        datos.name,
        datos.dni,
        datos.telefono,
        datos.provincia,
        datos.direccion,
        datos.localidad,
        datos.email,
        datos.password,
    ];

    for (const campo of camposObligatorios) {
        if (campo.trim() === '') {
            return 'Completá todos los campos para crear tu cuenta.';
        }
    }

    if (!/^\d{7,8}$/.test(datos.dni.trim())) {
        return 'El DNI debe tener 7 u 8 números.';
    }

    if (datos.password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (datos.aceptoDdjj !== true) {
        return 'Para registrarte tenés que aceptar los Términos y la Declaración Jurada.';
    }

    return '';
}

export async function consultarPerfil(userId) {
    return supabase
        .from('profiles')
        .select('id, name, dni, telefono, provincia, direccion, localidad, rol, is_validado')
        .eq('id', userId)
        .single();
}

export async function registrarUsuario(datos) {
    return supabase.auth.signUp({
        email: datos.email.trim(),
        password: datos.password,
        options: {
            data: {
                name: datos.name.trim(),
                dni: datos.dni.trim(),
                telefono: datos.telefono.trim(),
                provincia: datos.provincia.trim(),
                direccion: datos.direccion.trim(),
                localidad: datos.localidad.trim(),
                acepto_ddjj: true,
            },
        },
    });
}

export async function iniciarSesionUsuario(email, password) {
    return supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
    });
}

export async function cerrarSesionUsuario() {
    return supabase.auth.signOut();
}

export function suscribirAuth(callback) {
    return supabase.auth.onAuthStateChange(callback);
}
