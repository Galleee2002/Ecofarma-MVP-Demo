<script setup>
import { computed } from 'vue';
import { LoaderCircle } from '@lucide/vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
    },
    size: {
        type: String,
        default: 'md',
    },
    type: {
        type: String,
        default: 'button',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const clasesBase = [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2',
    'rounded-md border font-sans font-semibold whitespace-nowrap select-none',
    'transition duration-150 ease-out motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

const variantes = {
    primary: 'border-transparent bg-primary text-surface shadow-sm hover:brightness-110 hover:shadow-md active:brightness-95',
    secondary: 'border-transparent bg-primary-soft text-primary hover:brightness-95 active:brightness-90',
    outline: 'border-primary bg-transparent text-primary hover:bg-primary-soft active:bg-primary/20',
    neutral: 'border-line bg-surface text-foreground hover:bg-muted/10 active:bg-muted/20',
    ghost: 'border-transparent bg-transparent text-primary hover:bg-primary-soft active:bg-primary/20',
    'on-primary': 'border-transparent bg-transparent text-surface hover:bg-surface/10 active:bg-surface/20',
    danger: 'border-transparent bg-danger text-surface shadow-sm hover:brightness-110 hover:shadow-md active:brightness-95',
};

const tamanos = {
    sm: 'min-h-8 px-3 text-sm',
    md: 'min-h-10 px-4 text-base',
    lg: 'min-h-12 px-6 text-lg',
};

const clases = computed(function () {
    const variante = variantes[props.variant] ?? variantes.primary;
    const tamano = tamanos[props.size] ?? tamanos.md;
    const foco = props.variant === 'on-primary'
        ? 'focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary'
        : 'focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';
    return [clasesBase, foco, variante, tamano].join(' ');
});

const tipoBoton = computed(function () {
    if (props.type === 'submit' || props.type === 'reset') {
        return props.type;
    }
    return 'button';
});

const estaDeshabilitado = computed(function () {
    return props.disabled || props.loading;
});
</script>

<template>
    <button
        :type="tipoBoton"
        :class="clases"
        :disabled="estaDeshabilitado"
        :aria-busy="loading ? true : undefined"
    >
        <LoaderCircle
            v-if="loading"
            class="shrink-0 animate-spin motion-reduce:animate-none"
            :size="16"
            aria-hidden="true"
        />
        <slot />
    </button>
</template>
