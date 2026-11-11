<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { Info } from '@lucide/vue';

const props = defineProps({
    texto: {
        type: String,
        required: true,
    },
    etiqueta: {
        type: String,
        default: 'Más información',
    },
});

const raiz = ref(null);
const abierto = ref(false);
const idPanel = useId();

const ariaExpanded = computed(function () {
    return abierto.value ? 'true' : 'false';
});

function abrir() {
    abierto.value = true;
}

function cerrar() {
    abierto.value = false;
}

function alternar() {
    abierto.value = !abierto.value;
}

function alTecla(evento) {
    if (evento.key === 'Escape') {
        cerrar();
    }
}

function alClicDocumento(evento) {
    if (!abierto.value || raiz.value === null) {
        return;
    }
    if (!raiz.value.contains(evento.target)) {
        cerrar();
    }
}

onMounted(function () {
    document.addEventListener('mousedown', alClicDocumento);
});

onBeforeUnmount(function () {
    document.removeEventListener('mousedown', alClicDocumento);
});
</script>

<template>
    <div
        ref="raiz"
        class="relative shrink-0"
        @mouseenter="abrir"
        @mouseleave="cerrar"
    >
        <button
            type="button"
            class="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-icon transition duration-150 ease-out hover:bg-muted/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none"
            :aria-label="etiqueta"
            :aria-expanded="ariaExpanded"
            :aria-controls="idPanel"
            @click.stop="alternar"
            @keydown="alTecla"
        >
            <Info class="size-5" aria-hidden="true" />
        </button>
        <div class="absolute bottom-full right-0 z-30 mb-1">
            <Transition name="info-tip">
                <div
                    v-show="abierto"
                    :id="idPanel"
                    role="tooltip"
                    class="w-56 max-w-[calc(100vw-2rem)] rounded-md border border-line bg-surface p-3 font-sans text-sm text-foreground shadow-md sm:w-64"
                >
                    {{ texto }}
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.info-tip-enter-active,
.info-tip-leave-active {
    transition:
        opacity 150ms ease-out,
        translate 150ms ease-out;
}

.info-tip-enter-from,
.info-tip-leave-to {
    opacity: 0;
    translate: 0 0.25rem;
}

.info-tip-enter-to,
.info-tip-leave-from {
    opacity: 1;
    translate: 0 0;
}

@media (prefers-reduced-motion: reduce) {
    .info-tip-enter-active,
    .info-tip-leave-active {
        transition: none;
    }

    .info-tip-enter-from,
    .info-tip-leave-to,
    .info-tip-enter-to,
    .info-tip-leave-from {
        translate: 0 0;
    }
}
</style>
