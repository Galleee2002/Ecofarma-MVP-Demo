<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Menu, X } from '@lucide/vue';

const props = defineProps({
    claro: {
        type: Boolean,
        default: false,
    },
    sticky: {
        type: Boolean,
        default: false,
    },
    logoTo: {
        type: [String, Object],
        default: '/',
    },
});

const ruta = useRoute();
const menuAbierto = ref(false);

watch(
    function () {
        return ruta.fullPath;
    },
    function () {
        menuAbierto.value = false;
    },
);

function alternarMenu() {
    menuAbierto.value = !menuAbierto.value;
}

function cerrarMenu() {
    if (!menuAbierto.value) {
        return;
    }
    queueMicrotask(function () {
        menuAbierto.value = false;
    });
}
</script>

<template>
    <header
        class="z-40"
        :class="[sticky ? 'sticky top-0' : 'relative', claro ? 'bg-surface text-primary' : 'bg-primary text-surface']"
        @keydown.esc="cerrarMenu"
    >
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8">
            <slot name="brand">
                <RouterLink :to="props.logoTo" class="inline-flex shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current" aria-label="ecofarma">
                    <span v-if="claro" role="img" aria-label="ecofarma" class="block size-14 bg-primary [mask-image:url('/logo.webp')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"></span>
                    <img v-else src="/logo.webp" alt="ecofarma" class="h-14 w-auto object-contain" />
                </RouterLink>
            </slot>

            <nav aria-label="Navegación principal" class="hidden items-center justify-center gap-1 lg:flex">
                <slot name="desktop-navigation" />
            </nav>

            <div class="hidden items-center justify-end gap-2 lg:flex">
                <slot name="actions" />
            </div>

            <div class="flex shrink-0 items-center gap-2 lg:hidden">
                <slot name="mobile-primary-action" />
                <button
                    type="button"
                    class="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-current transition hover:bg-primary-soft/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
                    :aria-expanded="menuAbierto"
                    aria-controls="navbar-menu-mobile"
                    :aria-label="menuAbierto ? 'Cerrar menú' : 'Abrir menú'"
                    @click="alternarMenu"
                >
                    <X v-if="menuAbierto" :size="24" aria-hidden="true" />
                    <Menu v-else :size="24" aria-hidden="true" />
                </button>
            </div>
        </div>

        <Transition name="navbar-menu">
            <div
                v-if="menuAbierto"
                id="navbar-menu-mobile"
                class="absolute inset-x-0 top-full overflow-x-clip border-t px-4 pb-5 pt-3 shadow-md sm:px-6 lg:hidden"
                :class="claro ? 'border-line bg-surface' : 'border-surface/20 bg-primary'"
                @click="cerrarMenu"
            >
                <nav aria-label="Navegación móvil" class="flex flex-col items-stretch gap-1">
                    <slot name="mobile-navigation" />
                </nav>
                <div class="mt-3 flex flex-col items-stretch gap-2">
                    <slot name="mobile-actions" />
                </div>
            </div>
        </Transition>
    </header>
</template>

<style scoped>
.navbar-menu-enter-active,
.navbar-menu-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
}

.navbar-menu-enter-from,
.navbar-menu-leave-to {
    transform: translateY(-0.375rem);
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .navbar-menu-enter-active,
    .navbar-menu-leave-active {
        transition: none;
    }
}
</style>
