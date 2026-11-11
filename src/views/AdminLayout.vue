<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { BookOpen, ChevronLeft, ChevronRight, Package, Users } from '@lucide/vue';

const route = useRoute();
const colapsado = ref(true);

const secciones = [
    { nombre: 'admin-donaciones', etiqueta: 'Donaciones', icono: Package },
    { nombre: 'admin-vademecum', etiqueta: 'Vademécum', icono: BookOpen },
    { nombre: 'admin-usuarios', etiqueta: 'Usuarios', icono: Users },
];

let consultaEscritorio = null;

function esEscritorio() {
    return window.matchMedia('(min-width: 768px)').matches;
}

function alCambiarViewport(evento) {
    if (!evento.matches) {
        colapsado.value = true;
    }
}

onMounted(function () {
    consultaEscritorio = window.matchMedia('(min-width: 768px)');
    if (consultaEscritorio.matches) {
        colapsado.value = false;
    }
    consultaEscritorio.addEventListener('change', alCambiarViewport);
});

onUnmounted(function () {
    if (consultaEscritorio === null) {
        return;
    }
    consultaEscritorio.removeEventListener('change', alCambiarViewport);
});

watch(
    function () {
        return route.name;
    },
    function () {
        if (esEscritorio()) {
            return;
        }
        colapsado.value = true;
    },
);

function alternarSidebar() {
    colapsado.value = !colapsado.value;
}

function cerrarOverlay() {
    colapsado.value = true;
}

function esActiva(nombre) {
    return route.name === nombre;
}

function claseAside() {
    const clases = [
        'relative flex shrink-0 flex-col gap-3 overflow-visible border-r border-line bg-background px-2 py-4',
        'transition-[width] duration-200 ease-out motion-reduce:transition-none',
    ];

    if (colapsado.value) {
        clases.push('sticky top-0 z-20 w-[4.25rem] self-stretch');
        return clases.join(' ');
    }

    clases.push(
        'w-56 max-md:fixed max-md:top-[5.5rem] max-md:bottom-0 max-md:left-0 max-md:z-30 max-md:shadow-md md:sticky md:top-0 md:z-20 md:self-stretch',
    );
    return clases.join(' ');
}

function claseEnlace(nombre) {
    const clases = [
        'flex min-h-11 items-center rounded-md transition duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'motion-reduce:transition-none',
    ];

    if (colapsado.value) {
        clases.push('justify-center px-0');
    } else {
        clases.push('justify-start gap-3 px-3');
    }

    if (esActiva(nombre)) {
        clases.push(
            'bg-primary-soft font-semibold text-primary',
        );
    } else {
        clases.push('text-foreground hover:bg-primary-soft/70');
    }

    return clases.join(' ');
}
</script>

<template>
    <div class="flex min-h-[calc(100dvh-5.5rem)]">
        <aside :class="claseAside()" aria-label="Administración">
            <nav id="admin-secciones" class="mt-10 flex flex-col gap-1" aria-label="Secciones de administración">
                <RouterLink
                    v-for="seccion in secciones"
                    :key="seccion.nombre"
                    :to="{ name: seccion.nombre }"
                    :class="claseEnlace(seccion.nombre)"
                    :title="colapsado ? seccion.etiqueta : undefined"
                    :aria-current="esActiva(seccion.nombre) ? 'page' : undefined"
                >
                    <component :is="seccion.icono" class="shrink-0 text-icon" :size="20" aria-hidden="true" />
                    <span :class="colapsado ? 'sr-only' : 'truncate'">{{ seccion.etiqueta }}</span>
                </RouterLink>
            </nav>
            <button
                type="button"
                class="absolute top-4 right-0 z-40 inline-flex size-8 translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-icon shadow-sm transition duration-150 ease-out hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                :aria-expanded="colapsado ? 'false' : 'true'"
                aria-controls="admin-secciones"
                :aria-label="colapsado ? 'Expandir menú de administración' : 'Contraer menú de administración'"
                @click="alternarSidebar"
            >
                <ChevronRight v-if="colapsado" :size="16" aria-hidden="true" />
                <ChevronLeft v-else :size="16" aria-hidden="true" />
            </button>
        </aside>
        <div v-if="!colapsado" class="w-[4.25rem] shrink-0 md:hidden" aria-hidden="true"></div>
        <button
            v-if="!colapsado"
            type="button"
            class="fixed inset-x-0 bottom-0 top-[5.5rem] z-20 bg-foreground/45 md:hidden"
            aria-label="Cerrar menú de administración"
            @click="cerrarOverlay"
        ></button>
        <div class="min-w-0 flex-1 px-4 py-6 sm:px-6">
            <RouterView v-slot="{ Component }">
                <Transition name="admin-page" mode="out-in">
                    <component :is="Component" :key="route.name" />
                </Transition>
            </RouterView>
        </div>
    </div>
</template>

<style>
.admin-page-enter-active,
.admin-page-leave-active {
    transition: opacity 180ms ease-out;
}

.admin-page-enter-from,
.admin-page-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .admin-page-enter-active,
    .admin-page-leave-active {
        transition: none;
    }
}
</style>
