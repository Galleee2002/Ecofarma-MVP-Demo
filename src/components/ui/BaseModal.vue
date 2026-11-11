<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, useSlots, watch } from 'vue';
import { X } from '@lucide/vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    variant: {
        type: String,
        default: 'default',
    },
    title: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    eyebrow: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true,
    },
    closeOnEsc: {
        type: Boolean,
        default: true,
    },
    showClose: {
        type: Boolean,
        default: true,
    },
    locked: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:open', 'close']);
const attrs = useAttrs();
const slots = useSlots();

const nodoDialogo = ref(null);
const visible = ref(false);
const cerrando = ref(false);
const cierreEmitido = ref(false);
const esperandoCierreNativo = ref(false);

const idTitulo = useId();
const idDescripcion = useId();

let focoAnterior = null;
let overflowAnterior = '';
let paddingAnterior = '';
let scrollBloqueado = false;
let temporizadorSalida = null;

const variante = computed(function () {
    if (props.variant === 'danger' || props.variant === 'success') {
        return props.variant;
    }
    return 'default';
});

const tamano = computed(function () {
    if (props.size === 'sm' || props.size === 'lg') {
        return props.size;
    }
    return 'md';
});

const usaEncabezadoPorDefecto = computed(function () {
    return typeof slots.header !== 'function';
});

const tieneTitulo = computed(function () {
    return props.title !== '';
});

const tieneDescripcion = computed(function () {
    return props.description !== '';
});

const tieneEyebrow = computed(function () {
    return props.eyebrow !== '';
});

const muestraEncabezadoPorDefecto = computed(function () {
    return usaEncabezadoPorDefecto.value && (tieneTitulo.value || tieneDescripcion.value || tieneEyebrow.value);
});

const etiquetaAccesible = computed(function () {
    if (usaEncabezadoPorDefecto.value && tieneTitulo.value) {
        return undefined;
    }
    if (typeof attrs['aria-label'] === 'string' && attrs['aria-label'] !== '') {
        return attrs['aria-label'];
    }
    return 'Diálogo';
});

const idEtiqueta = computed(function () {
    if (usaEncabezadoPorDefecto.value && tieneTitulo.value) {
        return idTitulo;
    }
    return undefined;
});

const idDescripcionActiva = computed(function () {
    if (usaEncabezadoPorDefecto.value && tieneDescripcion.value) {
        return idDescripcion;
    }
    return undefined;
});

const rolDialogo = computed(function () {
    if (variante.value === 'danger') {
        return 'alertdialog';
    }
    return 'dialog';
});

const etiquetaContexto = computed(function () {
    if (variante.value === 'danger') {
        return 'Acción destructiva';
    }
    if (variante.value === 'success') {
        return 'Confirmación';
    }
    return '';
});

const clasesEyebrow = computed(function () {
    const base = 'font-sans text-xs font-semibold tracking-[0.14em] uppercase';
    if (variante.value === 'danger') {
        return base + ' text-danger';
    }
    if (variante.value === 'success') {
        return base + ' text-icon';
    }
    return base + ' text-primary';
});

const clasesAncho = computed(function () {
    if (tamano.value === 'sm') {
        return 'max-w-sm';
    }
    if (tamano.value === 'lg') {
        return 'max-w-2xl';
    }
    return 'max-w-[480px]';
});

const clasesRelleno = computed(function () {
    if (tamano.value === 'sm') {
        return 'p-5 sm:p-6';
    }
    if (tamano.value === 'lg') {
        return 'p-8';
    }
    return 'p-6 sm:p-8';
});

const clasesTitulo = computed(function () {
    if (tamano.value === 'sm') {
        return 'font-heading text-lg font-bold text-balance text-foreground';
    }
    return 'font-heading text-xl font-bold text-balance text-foreground';
});

const clasesPanel = computed(function () {
    return [
        'panel-modal relative z-10 w-full origin-center',
        clasesAncho.value,
        clasesRelleno.value,
        'rounded-lg border border-line bg-surface shadow-lg',
        'flex max-h-[min(90dvh,100%)] flex-col overflow-y-auto overscroll-contain',
    ].join(' ');
});

const clasesEncabezado = computed(function () {
    if (props.showClose) {
        return 'flex min-w-0 flex-col gap-2 pr-10';
    }
    return 'flex min-w-0 flex-col gap-2';
});

const clasesPie = [
    'flex w-full flex-col gap-3 sm:flex-row sm:items-stretch',
    '[&>*]:w-full [&>*]:min-w-0 [&>*]:whitespace-normal sm:[&>*]:flex-1',
].join(' ');

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

function primerControl(contenedor) {
    if (!contenedor) {
        return null;
    }
    return contenedor.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
}

function enfocarInicial() {
    const dialogo = nodoDialogo.value;
    if (!dialogo) {
        return;
    }

    if (variante.value === 'danger') {
        const pie = dialogo.querySelector('[data-modal-footer]');
        const seguro = primerControl(pie);
        if (seguro) {
            seguro.focus();
            return;
        }
    }

    if (usaEncabezadoPorDefecto.value && tieneTitulo.value) {
        const titulo = dialogo.querySelector('[data-modal-title]');
        if (titulo) {
            titulo.focus();
            return;
        }
    }

    dialogo.focus();
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
    await nextTick();
    enfocarInicial();
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

    const dialogo = nodoDialogo.value;
    if (dialogo && dialogo.open) {
        esperandoCierreNativo.value = true;
        dialogo.close();
    }

    visible.value = false;
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

    cerrando.value = true;
    visible.value = false;

    const espera = prefiereMenosMovimiento() ? 0 : 220;
    temporizadorSalida = setTimeout(function () {
        finalizarCierre();
    }, espera);
}

function pedirCierreUsuario() {
    if (props.locked) {
        return;
    }
    iniciarCierre();
}

function alTerminarSalida() {
    finalizarCierre();
}

function alCancelar(evento) {
    evento.preventDefault();
    if (!props.closeOnEsc) {
        return;
    }
    pedirCierreUsuario();
}

function alTecla(evento) {
    if (evento.key !== 'Escape') {
        return;
    }
    evento.preventDefault();
    if (!props.closeOnEsc) {
        return;
    }
    pedirCierreUsuario();
}

function alClicFondo() {
    if (!props.closeOnBackdrop) {
        return;
    }
    pedirCierreUsuario();
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
    <dialog
        ref="nodoDialogo"
        v-bind="attrs"
        class="base-modal fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-none overflow-y-auto border-0 bg-transparent p-0 backdrop:bg-transparent open:flex"
        :role="rolDialogo"
        :aria-labelledby="idEtiqueta"
        :aria-describedby="idDescripcionActiva"
        :aria-label="etiquetaAccesible"
        :aria-busy="locked ? true : undefined"
        tabindex="-1"
        @cancel="alCancelar"
        @keydown="alTecla"
        @close="alCerrarNativo"
    >
        <Transition name="modal" @after-leave="alTerminarSalida">
            <div
                v-if="visible"
                class="flex min-h-dvh w-full items-center justify-center bg-foreground/45 p-4"
                @click="alClicFondo"
            >
                <div :class="clasesPanel" @click.stop>
                    <button
                        v-if="showClose"
                        type="button"
                        class="absolute top-3 right-3 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm text-muted transition duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:top-4 sm:right-4"
                        aria-label="Cerrar"
                        :disabled="locked"
                        @click="pedirCierreUsuario"
                    >
                        <X :size="16" aria-hidden="true" />
                    </button>
                    <p v-if="etiquetaContexto !== ''" class="sr-only">{{ etiquetaContexto }}</p>
                    <div class="flex min-h-0 flex-1 flex-col gap-6">
                        <header v-if="$slots.header || muestraEncabezadoPorDefecto" :class="clasesEncabezado">
                            <slot name="header">
                                <p v-if="tieneEyebrow" :class="clasesEyebrow">{{ eyebrow }}</p>
                                <h2
                                    v-if="tieneTitulo"
                                    :id="idTitulo"
                                    class="outline-none"
                                    :class="clasesTitulo"
                                    data-modal-title
                                    tabindex="-1"
                                >
                                    {{ title }}
                                </h2>
                                <p v-if="tieneDescripcion" :id="idDescripcion" class="font-sans text-base text-pretty text-muted">
                                    {{ description }}
                                </p>
                            </slot>
                        </header>
                        <div v-if="$slots.default" class="min-w-0 font-sans text-base text-foreground">
                            <slot />
                        </div>
                        <div v-if="$slots.footer" :class="clasesPie" data-modal-footer>
                            <slot name="footer" />
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </dialog>
</template>

<style scoped>
.modal-enter-active {
    transition: opacity 240ms cubic-bezier(0.33, 1, 0.68, 1);
}

.modal-leave-active {
    transition: opacity 190ms cubic-bezier(0.32, 0, 0.67, 0);
}

.modal-enter-active .panel-modal,
.modal-leave-active .panel-modal {
    transition: transform 240ms cubic-bezier(0.33, 1, 0.68, 1);
}

.modal-leave-active .panel-modal {
    transition-duration: 190ms;
    transition-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .panel-modal,
.modal-leave-to .panel-modal {
    transform: scale(0.97);
}

.modal-enter-to,
.modal-leave-from {
    opacity: 1;
}

.modal-enter-to .panel-modal,
.modal-leave-from .panel-modal {
    transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
    .modal-enter-active,
    .modal-leave-active,
    .modal-enter-active .panel-modal,
    .modal-leave-active .panel-modal {
        transition: opacity 180ms ease;
    }

    .modal-enter-from .panel-modal,
    .modal-leave-to .panel-modal,
    .modal-enter-to .panel-modal,
    .modal-leave-from .panel-modal {
        transform: none;
    }
}
</style>
