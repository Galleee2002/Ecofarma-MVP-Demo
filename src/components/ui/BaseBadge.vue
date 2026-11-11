<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'neutral',
    },
    size: {
        type: String,
        default: 'md',
    },
    rounded: {
        type: Boolean,
        default: true,
    },
});

const clasesBase = [
    'inline-flex w-fit min-w-0 max-w-full items-center justify-center align-middle',
    'font-sans font-semibold text-center break-words',
].join(' ');

const variantes = {
    success: 'bg-success text-foreground',
    info: 'bg-primary text-surface',
    warning: 'bg-warning text-foreground',
    danger: 'bg-danger text-foreground',
    neutral: 'bg-muted text-surface',
};

const tamanos = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
};

const clases = computed(function () {
    const variante = variantes[props.variant] ?? variantes.neutral;
    const tamano = tamanos[props.size] ?? tamanos.md;
    const radio = props.rounded ? 'rounded-full' : 'rounded-sm';
    return [clasesBase, variante, tamano, radio].join(' ');
});
</script>

<template>
    <span :class="clases">
        <slot />
    </span>
</template>
