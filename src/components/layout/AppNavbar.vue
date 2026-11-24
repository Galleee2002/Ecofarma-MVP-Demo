<script setup>
import { useRoute } from 'vue-router';
import { Building2, Heart, House, User } from '@lucide/vue';

const route = useRoute();

const pestañas = [
    {
        id: 'inicio',
        etiqueta: 'Inicio',
        destino: { name: 'recibir' },
        icono: House,
    },
    {
        id: 'donar',
        etiqueta: 'Donar',
        destino: { name: 'donar' },
        icono: Heart,
    },
    {
        id: 'adheridos',
        etiqueta: 'Adheridos',
        destino: { name: 'adheridos' },
        icono: Building2,
    },
    {
        id: 'perfil',
        etiqueta: 'Perfil',
        destino: { name: 'perfil' },
        icono: User,
    },
];

function pestañaActiva(pestaña) {
    if (pestaña.id === 'inicio') {
        return route.name === 'recibir' || route.name === 'catalogo' || route.name === 'medicamento-detalle';
    }
    if (pestaña.id === 'donar') {
        return route.name === 'donar';
    }
    if (pestaña.id === 'adheridos') {
        return route.name === 'adheridos';
    }
    if (pestaña.id === 'perfil') {
        return route.name === 'perfil';
    }
    return false;
}

function clasesPestaña(pestaña) {
    const activa = pestañaActiva(pestaña);
    return [
        'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5',
        'font-heading text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-icon',
        'motion-reduce:transition-none',
        activa ? 'bg-primary-soft text-icon' : 'text-muted',
    ].join(' ');
}
</script>

<template>
    <nav
        aria-label="Navegación principal"
        class="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
        <div
            class="pointer-events-auto flex w-full max-w-md items-center gap-1 rounded-full bg-surface p-1.5 shadow-md"
        >
            <RouterLink
                v-for="pestaña in pestañas"
                :key="pestaña.id"
                :to="pestaña.destino"
                :class="clasesPestaña(pestaña)"
                :aria-current="pestañaActiva(pestaña) ? 'page' : undefined"
            >
                <component :is="pestaña.icono" :size="22" stroke-width="1.75" aria-hidden="true" />
                <span>{{ pestaña.etiqueta }}</span>
            </RouterLink>
        </div>
    </nav>
</template>
