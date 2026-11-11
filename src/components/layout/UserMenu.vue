<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronDown, UserRound } from '@lucide/vue';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps({
    esAdmin: {
        type: Boolean,
        default: false,
    },
    modo: {
        type: String,
        default: 'desktop',
    },
    nombre: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['logout']);
const route = useRoute();
const router = useRouter();
const abierto = ref(false);
const raiz = ref(null);
const disparador = ref(null);
const menu = ref(null);
const idMenu = props.modo === 'mobile' ? 'menu-usuario-mobile' : 'menu-usuario-desktop';

onMounted(function () {
    document.addEventListener('pointerdown', cerrarAlHacerClickFuera);
});

onBeforeUnmount(function () {
    document.removeEventListener('pointerdown', cerrarAlHacerClickFuera);
});

function cerrarAlHacerClickFuera(evento) {
    if (raiz.value !== null && !raiz.value.contains(evento.target)) {
        abierto.value = false;
    }
}

async function alternarMenu() {
    abierto.value = !abierto.value;
    if (abierto.value) {
        await nextTick();
        enfocarElemento(0);
    }
}

function cerrarMenu(devolverFoco) {
    abierto.value = false;
    if (devolverFoco) {
        nextTick(function () {
            disparador.value?.$el?.focus?.();
            if (disparador.value instanceof HTMLElement) {
                disparador.value.focus();
            }
        });
    }
}

function elementosMenu() {
    if (menu.value === null) {
        return [];
    }
    return Array.from(menu.value.querySelectorAll('[role="menuitem"]'));
}

function enfocarElemento(indice) {
    const elementos = elementosMenu();
    if (elementos.length > 0) {
        elementos[indice]?.focus({ preventScroll: true });
    }
}

function moverFoco(evento) {
    const elementos = elementosMenu();
    const indiceActual = elementos.indexOf(document.activeElement);

    if (evento.key === 'Escape') {
        evento.preventDefault();
        evento.stopPropagation();
        cerrarMenu(true);
        return;
    }

    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
        evento.preventDefault();
        const direccion = evento.key === 'ArrowDown' ? 1 : -1;
        const indiceSiguiente = (indiceActual + direccion + elementos.length) % elementos.length;
        enfocarElemento(indiceSiguiente);
    }

    if (evento.key === 'Home') {
        evento.preventDefault();
        enfocarElemento(0);
    }

    if (evento.key === 'End') {
        evento.preventDefault();
        enfocarElemento(elementos.length - 1);
    }
}

function irAAdministracion() {
    cerrarMenu(false);
    router.push({ name: 'admin-donaciones' });
}

function cerrarSesion() {
    cerrarMenu(false);
    emit('logout');
}
</script>

<template>
    <div
        ref="raiz"
        :class="
            modo === 'mobile'
                ? 'relative flex w-full min-w-0 flex-col items-stretch'
                : 'relative flex items-center gap-2'
        "
        @keydown="moverFoco"
    >
        <p
            v-if="modo !== 'mobile' && nombre !== ''"
            class="max-w-40 truncate whitespace-nowrap font-sans text-sm text-surface"
        >
            Bienvenido/a {{ nombre }}
        </p>
        <BaseButton
            ref="disparador"
            variant="on-primary"
            :size="modo === 'mobile' ? 'md' : 'sm'"
            :class="modo === 'mobile' ? 'w-full justify-start' : 'size-10 !rounded-full !p-0'"
            :aria-label="modo === 'mobile' ? 'Abrir menú de usuario' : 'Menú de usuario'"
            aria-haspopup="menu"
            :aria-expanded="abierto"
            :aria-controls="idMenu"
            @click.stop="alternarMenu"
        >
            <UserRound :size="20" aria-hidden="true" />
            <span v-if="modo === 'mobile'">Mi cuenta</span>
            <ChevronDown v-if="modo === 'mobile'" :size="16" class="ml-auto" aria-hidden="true" />
        </BaseButton>

        <div
            v-if="abierto"
            :id="idMenu"
            ref="menu"
            role="menu"
            aria-label="Opciones de usuario"
            class="z-50 flex flex-col gap-1 rounded-md border border-line bg-surface p-2 text-foreground shadow-md"
            :class="modo === 'mobile' ? 'mt-2 w-full min-w-0' : 'absolute right-0 top-full mt-2 min-w-56'"
        >
            <button
                v-if="props.esAdmin"
                type="button"
                role="menuitem"
                tabindex="-1"
                class="flex min-h-10 items-center rounded-sm px-3 py-2 text-left hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :class="String(route.name).startsWith('admin-') ? 'bg-primary-soft' : ''"
                :aria-current="String(route.name).startsWith('admin-') ? 'page' : undefined"
                @click="irAAdministracion"
            >
                Panel de administración
            </button>
            <div v-if="props.esAdmin" class="my-1 border-t border-line" role="separator" />
            <button
                type="button"
                role="menuitem"
                tabindex="-1"
                class="flex min-h-10 items-center rounded-sm px-3 py-2 text-left text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                @click="cerrarSesion"
            >
                Cerrar sesión
            </button>
        </div>
    </div>
</template>
