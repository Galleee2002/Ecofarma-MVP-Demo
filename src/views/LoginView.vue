<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { cargando, error, iniciarSesion, mostrarAviso } = useAuth();
const { email, password, ingresar } = useLoginForm(route, router, iniciarSesion, mostrarAviso);

function useLoginForm(route, router, iniciarSesion, mostrarAviso) {
    const email = ref('');
    const password = ref('');

    async function ingresar() {
        const ingreso = await iniciarSesion(email.value, password.value);
        if (!ingreso) {
            return;
        }

        mostrarAviso('Iniciaste sesión correctamente.', 'exito');

        const destino = route.query.redirect;
        if (typeof destino === 'string' && destino.startsWith('/')) {
            router.push(destino);
        } else {
            router.push({ name: 'catalogo' });
        }
    }

    return {
        email,
        password,
        ingresar,
    };
}
</script>

<template>
    <main class="fondo-trama flex min-h-[calc(100dvh-5rem)] items-start justify-center px-4 py-6 sm:items-center sm:py-10">
        <div class="flex w-full max-w-md flex-col gap-4">
            <RouterLink :to="{ name: 'catalogo' }" class="w-fit text-primary">Volver al catálogo</RouterLink>
            <BaseCard variant="surface" padding="lg" class="w-full rounded-md shadow-md">
                <div class="flex flex-col gap-4">
                    <h1 class="text-primary">Iniciá sesión</h1>
                    <p class="text-muted">Accedé a tu cuenta para donar o solicitar medicamentos.</p>

                    <form class="flex flex-col gap-4" @submit.prevent="ingresar">
                        <BaseInput
                            id="login-email"
                            v-model="email"
                            label="Correo electrónico"
                            type="email"
                            placeholder="tuemail@gmail.com"
                            autocomplete="email"
                            required
                        />
                        <BaseInput
                            id="login-password"
                            v-model="password"
                            label="Contraseña"
                            type="password"
                            placeholder="Tu contraseña"
                            autocomplete="current-password"
                            required
                        />
                        <BaseAlert v-if="error !== ''" variant="error" :message="error" />
                        <BaseButton type="submit" variant="primary" class="w-full" :loading="cargando">
                            {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
                        </BaseButton>
                    </form>

                    <p class="text-muted">
                        ¿Primera vez en ecofarma?
                        <RouterLink :to="{ name: 'registro' }" class="text-primary">Creá tu cuenta</RouterLink>
                    </p>
                </div>
            </BaseCard>
        </div>
    </main>
</template>
