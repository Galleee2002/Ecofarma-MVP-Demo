<script setup>
import { computed } from 'vue';
import { Check, Info, TriangleAlert, X } from '@lucide/vue';
import BaseFieldError from './BaseFieldError.vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'info',
    },
    title: {
        type: String,
        default: '',
    },
    message: {
        type: String,
        default: '',
    },
    dismissible: {
        type: Boolean,
        default: false,
    },
    showIcon: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['close']);

const variantes = {
    success: {
        icono: 'bg-success text-foreground',
        figura: Check,
        rol: 'status',
        etiqueta: 'Éxito',
    },
    error: {
        icono: 'text-danger',
        figura: X,
        rol: 'alert',
        etiqueta: 'Error',
    },
    warning: {
        icono: 'bg-warning text-foreground',
        figura: TriangleAlert,
        rol: 'alert',
        etiqueta: 'Advertencia',
    },
    info: {
        icono: 'bg-primary text-surface',
        figura: Info,
        rol: 'status',
        etiqueta: 'Información',
    },
};

const clasesBase = [
    'flex w-full items-start gap-3',
    'rounded-md border border-line bg-surface shadow-sm',
    'px-4 py-3.5',
].join(' ');

const clasesIconoBase = 'flex size-8 shrink-0 items-center justify-center rounded-sm';

const varianteActual = computed(function () {
    return variantes[props.variant] ?? variantes.info;
});

const esError = computed(function () {
    return props.variant === 'error';
});

const clasesIcono = computed(function () {
    return [clasesIconoBase, varianteActual.value.icono].join(' ');
});

const rol = computed(function () {
    return varianteActual.value.rol;
});

const tieneTitulo = computed(function () {
    return props.title !== '';
});

const tieneMensaje = computed(function () {
    return props.message !== '';
});

const clasesMensaje = computed(function () {
    if (tieneTitulo.value) {
        return 'font-sans text-sm whitespace-pre-line text-muted';
    }
    return 'font-sans text-sm whitespace-pre-line text-foreground';
});

const mensajeError = computed(function () {
    if (props.message !== '') {
        return props.message;
    }
    return props.title;
});

function cerrar() {
    emit('close');
}
</script>

<template>
    <BaseFieldError
        v-if="esError && !$slots.default && mensajeError !== ''"
        :message="mensajeError"
    />
    <div v-else-if="esError" class="flex w-full flex-col gap-1" :role="rol">
        <BaseFieldError v-if="mensajeError !== ''" :message="mensajeError" />
        <div v-if="$slots.default" class="font-sans text-xs text-danger">
            <slot />
        </div>
    </div>
    <div v-else :class="clasesBase">
        <div class="flex min-w-0 flex-1 items-start gap-3" :role="rol">
            <span v-if="!tieneTitulo" class="sr-only">{{ varianteActual.etiqueta }}</span>
            <span v-if="showIcon" :class="clasesIcono" aria-hidden="true">
                <component :is="varianteActual.figura" :size="16" />
            </span>
            <div class="min-w-0 flex-1 space-y-1 pt-0.5">
                <p v-if="tieneTitulo" class="font-heading text-base font-bold text-foreground">
                    {{ title }}
                </p>
                <p v-if="tieneMensaje" :class="clasesMensaje">
                    {{ message }}
                </p>
                <div v-if="$slots.default" class="font-sans text-sm">
                    <slot />
                </div>
            </div>
        </div>
        <button
            v-if="dismissible"
            type="button"
            class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
            aria-label="Cerrar mensaje"
            @click="cerrar"
        >
            <X :size="16" aria-hidden="true" />
        </button>
    </div>
</template>
