import { ref } from 'vue';
import {
    cerrarSesionUsuario,
    consultarPerfil,
    iniciarSesionUsuario,
    registrarUsuario,
    suscribirAuth,
    traducirError,
    validarRegistro,
} from '../lib/auth';
import { useToast } from './useToast';

const sesion = ref(null);
const perfil = ref(null);
const errorPerfil = ref('');
let authIniciado = false;

let resolverSesionInicial;
const sesionInicial = new Promise(function (resolver) {
    resolverSesionInicial = resolver;
});

let resolverPerfil;
let perfilListo = new Promise(function (resolver) {
    resolverPerfil = resolver;
});

function marcarPerfilListo() {
    resolverPerfil();
}

function resetearEsperaPerfil() {
    perfilListo = new Promise(function (resolver) {
        resolverPerfil = resolver;
    });
}

async function cargarPerfil() {
    errorPerfil.value = '';

    if (sesion.value === null) {
        perfil.value = null;
        marcarPerfilListo();
        return;
    }

    const { data, error: errorConsulta } = await consultarPerfil(sesion.value.user.id);

    if (errorConsulta) {
        console.error(errorConsulta);
        perfil.value = null;
        errorPerfil.value = 'No pudimos cargar tus datos. Recargá la página para intentar de nuevo.';
    } else {
        perfil.value = data;
    }

    marcarPerfilListo();
}

function actualizarSesion(nuevaSesion) {
    let idAnterior = null;
    if (sesion.value !== null) {
        idAnterior = sesion.value.user.id;
    }

    sesion.value = nuevaSesion;

    if (nuevaSesion === null) {
        perfil.value = null;
        errorPerfil.value = '';
        marcarPerfilListo();
    } else if (nuevaSesion.user.id !== idAnterior) {
        resetearEsperaPerfil();
        setTimeout(cargarPerfil, 0);
    }
}

function esperarPerfil() {
    if (sesion.value === null) {
        return Promise.resolve();
    }
    if (perfil.value !== null && perfil.value.id === sesion.value.user.id) {
        return Promise.resolve();
    }
    if (errorPerfil.value !== '') {
        return Promise.resolve();
    }
    return perfilListo;
}

function mostrarAviso(texto, tipo) {
    const { success, warning } = useToast();
    const opciones = { duration: 3000 };

    if (tipo === 'advertencia') {
        warning(texto, opciones);
        return;
    }

    success(texto, opciones);
}

function iniciarAuth() {
    if (authIniciado) {
        return;
    }
    authIniciado = true;

    suscribirAuth(function (evento, nuevaSesion) {
        actualizarSesion(nuevaSesion);

        if (evento === 'INITIAL_SESSION') {
            resolverSesionInicial();
        }
    });
}

function esperarSesionInicial() {
    iniciarAuth();
    return sesionInicial;
}

export function useAuth() {
    const cargando = ref(false);
    const error = ref('');

    async function registrarse(datos) {
        error.value = '';

        const errorValidacion = validarRegistro(datos);
        if (errorValidacion !== '') {
            error.value = errorValidacion;
            return false;
        }

        cargando.value = true;

        const { error: errorRegistro } = await registrarUsuario(datos);

        cargando.value = false;

        if (errorRegistro) {
            error.value = traducirError(errorRegistro, 'No pudimos crear tu cuenta. Intentá de nuevo en unos minutos.');
            return false;
        }

        return true;
    }

    async function iniciarSesion(email, password) {
        error.value = '';

        if (email.trim() === '' || password === '') {
            error.value = 'Ingresá tu email y tu contraseña.';
            return false;
        }

        cargando.value = true;

        const { error: errorLogin } = await iniciarSesionUsuario(email, password);

        cargando.value = false;

        if (errorLogin) {
            error.value = traducirError(errorLogin, 'No pudimos iniciar sesión. Intentá de nuevo en unos minutos.');
            return false;
        }

        return true;
    }

    async function cerrarSesion() {
        error.value = '';
        cargando.value = true;

        const { error: errorLogout } = await cerrarSesionUsuario();

        cargando.value = false;

        if (errorLogout) {
            error.value = traducirError(errorLogout, 'No pudimos cerrar la sesión. Intentá de nuevo.');
            return false;
        }

        return true;
    }

    return {
        sesion,
        perfil,
        errorPerfil,
        cargando,
        error,
        esperarSesionInicial,
        esperarPerfil,
        mostrarAviso,
        registrarse,
        iniciarSesion,
        cerrarSesion,
    };
}
