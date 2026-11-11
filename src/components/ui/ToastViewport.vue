<script setup>
import { nextTick } from 'vue';
import BaseToast from './BaseToast.vue';
import { useToast } from '../../composables/useToast';

const { toasts, dismiss, marcarHover, marcarFoco } = useToast();

function alPerderFoco(id, evento) {
    const destino = evento.relatedTarget;
    if (destino && evento.currentTarget.contains(destino)) {
        return;
    }
    marcarFoco(id, false);
}

function alCerrar(id) {
    const contenedor = document.querySelector('[data-toast-id="' + id + '"]');
    const manteniaFoco = contenedor && contenedor.contains(document.activeElement);
    dismiss(id);
    if (!manteniaFoco) {
        return;
    }
    nextTick(function () {
        const siguiente = document.querySelector('[aria-label="Cerrar notificación"]');
        if (siguiente) {
            siguiente.focus();
        }
    });
}
</script>

<template>
    <div class="pointer-events-none fixed top-24 right-4 z-50 w-[min(calc(100%-2rem),380px)] sm:right-6">
        <TransitionGroup name="toast" tag="div" class="relative flex w-full flex-col gap-3">
            <div
                v-for="item in toasts"
                :key="item.id"
                :data-toast-id="item.id"
                class="pointer-events-auto"
                @mouseenter="marcarHover(item.id, true)"
                @mouseleave="marcarHover(item.id, false)"
                @focusin="marcarFoco(item.id, true)"
                @focusout="alPerderFoco(item.id, $event)"
            >
                <BaseToast
                    :variant="item.variant"
                    :title="item.title"
                    :message="item.message"
                    @close="alCerrar(item.id)"
                />
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-enter-active {
    transition:
        transform 300ms cubic-bezier(0.33, 1, 0.68, 1),
        opacity 300ms cubic-bezier(0.33, 1, 0.68, 1);
}

.toast-leave-active {
    position: absolute;
    right: 0;
    width: 100%;
    transition:
        transform 200ms cubic-bezier(0.32, 0, 0.67, 0),
        opacity 200ms cubic-bezier(0.32, 0, 0.67, 0);
}

.toast-move {
    transition: transform 300ms cubic-bezier(0.33, 1, 0.68, 1);
}

.toast-enter-from,
.toast-leave-to {
    transform: translateX(20px);
    opacity: 0;
}

.toast-enter-to,
.toast-leave-from {
    transform: translateX(0);
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .toast-enter-active,
    .toast-leave-active {
        transition: opacity 200ms ease;
    }

    .toast-leave-active {
        position: static;
    }

    .toast-move {
        transition: none;
    }

    .toast-enter-from,
    .toast-leave-to,
    .toast-enter-to,
    .toast-leave-from {
        transform: none;
    }
}
</style>
