<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'neutral',
    },
});

const variantes = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-primary',
    neutral: 'text-muted',
};

const clases = computed(function () {
    return variantes[props.variant] ?? variantes.neutral;
});
</script>

<template>
    <span
        class="inline-flex w-fit max-w-full shrink-0 items-center gap-1.5 font-sans text-sm font-semibold"
        :class="clases"
    >
        <span class="size-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
        <span class="min-w-0 break-words"><slot /></span>
    </span>
</template>
