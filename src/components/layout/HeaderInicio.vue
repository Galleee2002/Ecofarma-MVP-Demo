<script setup>
import { computed, ref } from 'vue';
import { Search, Shield, User } from '@lucide/vue';
import { useAuth } from '../../composables/useAuth';
import BaseButton from '../ui/BaseButton.vue';
import ModalExito from '../ui/ModalExito.vue';

defineProps({
    modelValue: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue', 'buscar']);

const { perfil, sesion, cerrarSesion, mostrarAviso } = useAuth();

const modalCerrarSesion = ref(false);
const cerrandoSesion = ref(false);

const tieneSesion = computed(function () {
    return sesion.value !== null;
});

const esAdmin = computed(function () {
    return perfil.value !== null && perfil.value.rol === 'admin';
});

const nombre = computed(function () {
    if (perfil.value === null || typeof perfil.value.name !== 'string') {
        return '';
    }
    return perfil.value.name.trim();
});

const saludo = computed(function () {
    if (nombre.value === '') {
        return 'Hola';
    }
    return 'Hola ' + nombre.value;
});

const inicial = computed(function () {
    if (nombre.value === '') {
        return '';
    }
    return nombre.value.charAt(0).toUpperCase();
});

const clasesAvatar = [
    'flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-icon bg-surface',
].join(' ');

const clasesAvatarBoton = [
    clasesAvatar,
    'cursor-pointer transition duration-150 ease-out',
    'hover:bg-primary-soft/50',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-icon',
    'motion-reduce:transition-none',
].join(' ');

function actualizarBusqueda(evento) {
    emit('update:modelValue', evento.target.value);
}

function abrirModalCerrarSesion() {
    if (!tieneSesion.value) {
        return;
    }
    modalCerrarSesion.value = true;
}

async function confirmarCerrarSesion() {
    if (cerrandoSesion.value) {
        return;
    }

    cerrandoSesion.value = true;
    const ok = await cerrarSesion();
    cerrandoSesion.value = false;

    if (!ok) {
        return;
    }

    modalCerrarSesion.value = false;
    mostrarAviso('Cerraste sesión.', 'exito');
}
</script>

<template>
    <header class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
            <button
                v-if="tieneSesion"
                type="button"
                :class="clasesAvatarBoton"
                aria-label="Cerrar sesión"
                @click="abrirModalCerrarSesion"
            >
                <span
                    v-if="inicial !== ''"
                    class="font-heading text-lg font-bold text-primary"
                    aria-hidden="true"
                >
                    {{ inicial }}
                </span>
                <User v-else :size="22" class="text-icon" stroke-width="1.75" aria-hidden="true" />
            </button>
            <div
                v-else
                :class="clasesAvatar"
                aria-hidden="true"
            >
                <span
                    v-if="inicial !== ''"
                    class="font-heading text-lg font-bold text-primary"
                >
                    {{ inicial }}
                </span>
                <User v-else :size="22" class="text-icon" stroke-width="1.75" />
            </div>

            <div class="min-w-0 flex-1">
                <h1 class="truncate text-balance font-heading text-xl text-foreground">
                    {{ saludo }}
                </h1>
                <p class="text-sm text-muted">Bienvenido/a</p>
            </div>

            <RouterLink
                v-if="esAdmin"
                :to="{ name: 'admin-donaciones' }"
                class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-icon shadow-sm transition duration-150 ease-out hover:bg-primary-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-icon motion-reduce:transition-none"
                aria-label="Panel de administración"
            >
                <Shield :size="20" stroke-width="1.75" aria-hidden="true" />
            </RouterLink>
        </div>

        <form
            class="relative"
            role="search"
            @submit.prevent="emit('buscar')"
        >
            <Search
                :size="18"
                stroke-width="1.75"
                class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
                aria-hidden="true"
            />
            <input
                id="inicio-busqueda"
                type="search"
                :value="modelValue"
                placeholder="Buscar medicamento"
                aria-label="Buscar medicamento"
                class="w-full min-h-11 rounded-full border border-line bg-surface py-2.5 pr-24 pl-10 font-sans text-base text-foreground shadow-sm placeholder:text-muted transition duration-150 ease-out hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                @input="actualizarBusqueda"
            />
            <BaseButton
                type="submit"
                size="sm"
                class="absolute top-1/2 right-1.5 -translate-y-1/2"
            >
                Buscar
            </BaseButton>
        </form>

        <ModalExito
            v-model:open="modalCerrarSesion"
            titulo="¿Desea cerrar sesión?"
            :mostrar-icono="false"
        >
            <template #acciones="{ cerrar }">
                <div class="mt-2 flex w-full flex-col gap-3">
                    <BaseButton
                        variant="danger"
                        size="lg"
                        class="w-full"
                        :loading="cerrandoSesion"
                        @click="confirmarCerrarSesion"
                    >
                        Cerrar sesión
                    </BaseButton>
                    <BaseButton
                        variant="outline"
                        size="lg"
                        class="w-full bg-surface"
                        data-modal-exito-volver
                        :disabled="cerrandoSesion"
                        @click="cerrar"
                    >
                        Volver
                    </BaseButton>
                </div>
            </template>
        </ModalExito>
    </header>
</template>
