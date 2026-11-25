import { ref } from 'vue';

const MAXIMO_VISIBLES = 3;

const DURACION_POR_DEFECTO = {
    success: 4000,
    info: 4000,
    warning: 6000,
    error: 6000,
};

const toasts = ref([]);
const temporizadores = new Map();
const pausas = new Map();
let secuencia = 0;

function crearId() {
    secuencia += 1;
    return `toast-${secuencia}`;
}

function limpiarTemporizador(id) {
    const temporizador = temporizadores.get(id);
    if (temporizador && temporizador.idTimeout !== null) {
        clearTimeout(temporizador.idTimeout);
    }
    temporizadores.delete(id);
    pausas.delete(id);
}

function programarCierre(id, restante) {
    const actual = temporizadores.get(id);
    if (actual && actual.idTimeout !== null) {
        clearTimeout(actual.idTimeout);
    }

    if (restante <= 0) {
        dismiss(id);
        return;
    }

    const idTimeout = setTimeout(function () {
        dismiss(id);
    }, restante);

    temporizadores.set(id, {
        idTimeout,
        restante,
        iniciadoEn: Date.now(),
        pausado: false,
    });
}

function pausar(id) {
    const temporizador = temporizadores.get(id);
    if (!temporizador || temporizador.pausado) {
        return;
    }

    clearTimeout(temporizador.idTimeout);
    const restante = Math.max(0, temporizador.restante - (Date.now() - temporizador.iniciadoEn));
    temporizadores.set(id, {
        idTimeout: null,
        restante,
        iniciadoEn: 0,
        pausado: true,
    });
}

function reanudar(id) {
    const temporizador = temporizadores.get(id);
    if (!temporizador || !temporizador.pausado) {
        return;
    }

    programarCierre(id, temporizador.restante);
}

function actualizarPausa(id, tipo, activo) {
    if (!temporizadores.has(id)) {
        return;
    }

    const estado = pausas.get(id) ?? { hover: false, focus: false };
    estado[tipo] = activo;
    pausas.set(id, estado);

    if (estado.hover || estado.focus) {
        pausar(id);
        return;
    }

    reanudar(id);
}

function marcarHover(id, activo) {
    actualizarPausa(id, 'hover', activo);
}

function marcarFoco(id, activo) {
    actualizarPausa(id, 'focus', activo);
}

function dismiss(id) {
    limpiarTemporizador(id);
    toasts.value = toasts.value.filter(function (toast) {
        return toast.id !== id;
    });
}

function clear() {
    toasts.value.forEach(function (toast) {
        limpiarTemporizador(toast.id);
    });
    toasts.value = [];
}

function mostrar(variant, message, options) {
    const extras = options ?? {};
    const duracionPorDefecto = DURACION_POR_DEFECTO[variant] ?? DURACION_POR_DEFECTO.info;
    const duration = extras.duration !== undefined ? extras.duration : duracionPorDefecto;
    const id = crearId();

    toasts.value = [
        {
            id,
            variant,
            message,
            title: extras.title ?? '',
            duration,
        },
        ...toasts.value,
    ];

    while (toasts.value.length > MAXIMO_VISIBLES) {
        const antiguo = toasts.value[toasts.value.length - 1];
        dismiss(antiguo.id);
    }

    if (duration > 0) {
        programarCierre(id, duration);
    }

    return id;
}

function success(message, options) {
    return mostrar('success', message, options);
}

function error(message, options) {
    return mostrar('error', message, options);
}

function warning(message, options) {
    return mostrar('warning', message, options);
}

function info(message, options) {
    return mostrar('info', message, options);
}

export function useToast() {
    return {
        toasts,
        success,
        error,
        warning,
        info,
        dismiss,
        clear,
        marcarHover,
        marcarFoco,
    };
}
