<script setup>
import { useAuth } from './composables/useAuth';
import AppNavbar from './components/layout/AppNavbar.vue';
import BaseFieldError from './components/ui/BaseFieldError.vue';
import ToastViewport from './components/ui/ToastViewport.vue';

const { errorPerfil, error } = useAuth();

const vistasConBorrador = ['RegistroView', 'DonarView', 'MedicamentoDetalleView'];
</script>

<template>
    <AppNavbar />

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
</template>
