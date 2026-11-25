<script setup>
import { useAuth } from './composables/useAuth';
import { useModalExito } from './composables/useModalExito';
import AppNavbar from './components/layout/AppNavbar.vue';
import BaseFieldError from './components/ui/BaseFieldError.vue';
import ModalExito from './components/ui/ModalExito.vue';
import ToastViewport from './components/ui/ToastViewport.vue';

const { errorPerfil, error } = useAuth();
const { abierto: modalExitoAbierto, titulo: tituloExito, detalle: detalleExito } = useModalExito();

const vistasConBorrador = ['RegistroView', 'DonarView', 'MedicamentoDetalleView'];
</script>

<template>
    <div class="pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <BaseFieldError
            v-if="errorPerfil !== ''"
            class="mx-auto mt-4 max-w-5xl px-6"
            :message="errorPerfil"
        />
        <BaseFieldError
            v-if="error !== ''"
            class="mx-auto mt-4 max-w-5xl px-6"
            :message="error"
        />

        <RouterView v-slot="{ Component }">
            <KeepAlive :include="vistasConBorrador">
                <component :is="Component" />
            </KeepAlive>
        </RouterView>
        <ToastViewport />
        <AppNavbar />
    </div>
    <ModalExito
        v-model:open="modalExitoAbierto"
        :titulo="tituloExito"
        :detalle="detalleExito"
    />
</template>
