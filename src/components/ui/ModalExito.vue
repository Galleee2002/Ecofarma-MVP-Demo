<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { Check } from '@lucide/vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    titulo: {
        type: String,
        default: '',
    },
    detalle: {
        type: String,
        default: '',
    },
    mostrarIcono: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['update:open', 'close']);

const DURACION_SALIDA = 220;
const nodoDialogo = ref(null);
const visible = ref(false);
const animarIcono = ref(false);
const cerrando = ref(false);
const cierreEmitido = ref(false);
const esperandoCierreNativo = ref(false);

const idTitulo = useId();
const idDetalle = useId();

let focoAnterior = null;
let overflowAnterior = '';
let paddingAnterior = '';
let scrollBloqueado = false;
let temporizadorSalida = null;
let temporizadorIcono = null;

function prefiereMenosMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function guardarFoco() {
    if (focoAnterior !== null) {
        return;
    }
    const activo = document.activeElement;
    if (activo && activo !== document.body) {
        focoAnterior = activo;
    }
}

function restaurarFoco() {
    const destino = focoAnterior;
    focoAnterior = null;
    if (!destino || typeof destino.focus !== 'function') {
        return;
    }
    if (!document.contains(destino)) {
        return;
    }
    destino.focus();
}

function bloquearScroll() {
    if (scrollBloqueado) {
        return;
    }
    overflowAnterior = document.body.style.overflow;
    paddingAnterior = document.body.style.paddingRight;
    const barra = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (barra > 0) {
        document.body.style.paddingRight = barra + 'px';
    }
    scrollBloqueado = true;
}

function restaurarScroll() {
    if (!scrollBloqueado) {
        return;
    }
    document.body.style.overflow = overflowAnterior;
    document.body.style.paddingRight = paddingAnterior;
    scrollBloqueado = false;
}

function limpiarTemporizadorIcono() {
    if (temporizadorIcono !== null) {
        clearTimeout(temporizadorIcono);
        temporizadorIcono = null;
    }
}

function iniciarAnimacionIcono() {
    limpiarTemporizadorIcono();
    if (prefiereMenosMovimiento()) {
        animarIcono.value = true;
        return;
    }
    animarIcono.value = false;
    temporizadorIcono = setTimeout(function () {
        animarIcono.value = true;
        temporizadorIcono = null;
    }, 40);
}

async function abrir() {
    cierreEmitido.value = false;
    cerrando.value = false;
    if (temporizadorSalida !== null) {
        clearTimeout(temporizadorSalida);
        temporizadorSalida = null;
    }

    guardarFoco();
    bloquearScroll();
    await nextTick();

    const dialogo = nodoDialogo.value;
    if (!dialogo) {
        return;
    }

    if (!dialogo.open) {
        dialogo.showModal();
    }

    visible.value = true;
    iniciarAnimacionIcono();
    await nextTick();

    const botonVolver = dialogo.querySelector('[data-modal-exito-volver]');
    if (botonVolver && typeof botonVolver.focus === 'function') {
        botonVolver.focus();
        return;
    }
    dialogo.focus();
}

function finalizarCierre() {
    if (temporizadorSalida !== null) {
        clearTimeout(temporizadorSalida);
        temporizadorSalida = null;
    }

    if (cierreEmitido.value) {
        return;
    }
    cierreEmitido.value = true;

    limpiarTemporizadorIcono();

    const dialogo = nodoDialogo.value;
    if (dialogo && dialogo.open) {
        esperandoCierreNativo.value = true;
        dialogo.close();
    }

    visible.value = false;
    animarIcono.value = false;
    cerrando.value = false;
    restaurarScroll();
    restaurarFoco();

    if (props.open) {
        emit('update:open', false);
    }

    emit('close');
}

function iniciarCierre() {
    if (cerrando.value) {
        return;
    }

    const dialogo = nodoDialogo.value;
    if (!visible.value && (!dialogo || !dialogo.open)) {
        return;
    }

    limpiarTemporizadorIcono();
    cerrando.value = true;
    visible.value = false;

    const espera = prefiereMenosMovimiento() ? 0 : DURACION_SALIDA;
    temporizadorSalida = setTimeout(function () {
        finalizarCierre();
    }, espera);
}

function alTerminarSalida() {
    finalizarCierre();
}

function alCancelar(evento) {
    evento.preventDefault();
    iniciarCierre();
}

function alTecla(evento) {
    if (evento.key !== 'Escape') {
        return;
    }
    evento.preventDefault();
    iniciarCierre();
}

function alClicFondo() {
    iniciarCierre();
}

function alCerrarNativo() {
    if (esperandoCierreNativo.value) {
        esperandoCierreNativo.value = false;
        return;
    }
    visible.value = false;
    cerrando.value = true;
    finalizarCierre();
}

onMounted(function () {
    if (props.open) {
        abrir();
    }
});

watch(
    function () {
        return props.open;
    },
    function (abierto) {
        if (abierto) {
            abrir();
            return;
        }
        iniciarCierre();
    },
);

onBeforeUnmount(function () {
    limpiarTemporizadorIcono();
    if (temporizadorSalida !== null) {
        clearTimeout(temporizadorSalida);
        temporizadorSalida = null;
    }
    restaurarScroll();
    const dialogo = nodoDialogo.value;
    if (dialogo && dialogo.open) {
        dialogo.close();
    }
    focoAnterior = null;
});
</script>

<template>
    <Teleport to="body">
        <dialog
            ref="nodoDialogo"
            class="modal-exito fixed inset-0 z-[100] m-0 h-dvh max-h-dvh w-full max-w-none overflow-y-auto border-0 bg-transparent p-0 backdrop:bg-transparent open:flex"
            role="alertdialog"
            :aria-labelledby="idTitulo"
            :aria-describedby="detalle !== '' ? idDetalle : undefined"
            tabindex="-1"
            @cancel="alCancelar"
            @keydown="alTecla"
            @close="alCerrarNativo"
        >
            <Transition name="modal-exito" @after-leave="alTerminarSalida">
                <div
                    v-if="visible"
                    class="flex min-h-dvh w-full items-center justify-center bg-foreground/45 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]"
                    @click="alClicFondo"
                >
                    <div
                        class="panel-modal-exito relative z-10 w-[80%] max-w-sm origin-center rounded-lg bg-surface px-8 py-12 shadow-lg sm:w-full sm:max-w-md sm:px-10 sm:py-14"
                        @click.stop
                    >
                        <div class="flex flex-col items-center gap-6 text-center sm:gap-8">
                            <div
                                v-if="mostrarIcono"
                                class="icono-exito flex size-[4.5rem] items-center justify-center rounded-full border-2 border-foreground"
                                :class="{ 'icono-exito-activo': animarIcono }"
                                aria-hidden="true"
                            >
                                <Check
                                    class="tilde-exito size-9 text-success"
                                    :class="{ 'tilde-exito-activo': animarIcono }"
                                    :stroke-width="2.5"
                                />
                            </div>
                            <div class="flex w-full flex-col gap-2">
                                <h2
                                    :id="idTitulo"
                                    class="font-heading text-xl font-bold text-balance text-foreground"
                                >
                                    {{ titulo }}
                                </h2>
                                <p
                                    v-if="detalle !== ''"
                                    :id="idDetalle"
                                    class="font-sans text-base text-pretty text-muted"
                                >
                                    {{ detalle }}
                                </p>
                            </div>
                            <slot name="acciones" :cerrar="iniciarCierre">
                                <BaseButton
                                    variant="primary"
                                    size="lg"
                                    class="mt-2 w-full"
                                    data-modal-exito-volver
                                    @click="iniciarCierre"
                                >
                                    Volver
                                </BaseButton>
                            </slot>
                        </div>
                    </div>
                </div>
            </Transition>
        </dialog>
    </Teleport>
</template>

<style scoped>
.modal-exito-enter-active {
    transition: opacity 240ms cubic-bezier(0.33, 1, 0.68, 1);
}

.modal-exito-leave-active {
    transition: opacity 190ms cubic-bezier(0.32, 0, 0.67, 0);
}

.modal-exito-enter-active .panel-modal-exito,
.modal-exito-leave-active .panel-modal-exito {
    transition: transform 240ms cubic-bezier(0.33, 1, 0.68, 1);
}

.modal-exito-leave-active .panel-modal-exito {
    transition-duration: 190ms;
    transition-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
}

.modal-exito-enter-from,
.modal-exito-leave-to {
    opacity: 0;
}

.modal-exito-enter-from .panel-modal-exito,
.modal-exito-leave-to .panel-modal-exito {
    transform: scale(0.97);
}

.modal-exito-enter-to,
.modal-exito-leave-from {
    opacity: 1;
}

.modal-exito-enter-to .panel-modal-exito,
.modal-exito-leave-from .panel-modal-exito {
    transform: scale(1);
}

.icono-exito {
    transform: scale(0.82);
    opacity: 0;
    transition:
        transform 420ms cubic-bezier(0.34, 1.45, 0.64, 1),
        opacity 220ms ease-out;
}

.icono-exito-activo {
    transform: scale(1);
    opacity: 1;
}

.tilde-exito {
    transform: scale(0.55);
    opacity: 0;
    transition:
        transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1) 120ms,
        opacity 220ms ease-out 120ms;
}

.tilde-exito-activo {
    transform: scale(1);
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .modal-exito-enter-active,
    .modal-exito-leave-active,
    .modal-exito-enter-active .panel-modal-exito,
    .modal-exito-leave-active .panel-modal-exito {
        transition: opacity 180ms ease;
    }

    .modal-exito-enter-from .panel-modal-exito,
    .modal-exito-leave-to .panel-modal-exito,
    .modal-exito-enter-to .panel-modal-exito,
    .modal-exito-leave-from .panel-modal-exito {
        transform: none;
    }

    .icono-exito,
    .tilde-exito {
        transform: none;
        opacity: 1;
        transition: none;
    }
}
</style>
