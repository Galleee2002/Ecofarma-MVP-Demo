<script setup>
import { X } from '@lucide/vue';

defineProps({
    id: {
        type: String,
        default: undefined,
    },
    message: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <p
        :id="id"
        class="flex items-start gap-1.5 font-sans text-xs text-danger"
        role="alert"
    >
        <X class="mt-0.5 shrink-0" :size="14" aria-hidden="true" />
        <span class="min-w-0 whitespace-pre-line">{{ message }}</span>
    </p>
</template>
