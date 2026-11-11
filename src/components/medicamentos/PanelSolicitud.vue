<script setup>
import { X } from '@lucide/vue';
import BaseAlert from '../ui/BaseAlert.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseCard from '../ui/BaseCard.vue';
import BaseCheckbox from '../ui/BaseCheckbox.vue';
import BaseFileDrop from '../ui/BaseFileDrop.vue';

defineProps({
    sesion: {
        type: Object,
        default: null,
    },
    perfil: {
        type: Object,
        default: null,
    },
    requiereReceta: {
        type: Boolean,
        default: false,
    },
    cuentaSuspendida: {
        type: Boolean,
        default: false,
    },
    puedeSolicitar: {
        type: Boolean,
        default: false,
    },
    creando: {
        type: Boolean,
        default: false,
    },
    errorPerfil: {
        type: String,
        default: '',
    },
    errorCrear: {
        type: String,
        default: '',
    },
    mensajeCrear: {
        type: String,
        default: '',
    },
    aceptoDdjj: {
        type: Boolean,
        default: false,
    },
    archivoReceta: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits([
    'update:aceptoDdjj',
    'elegir-receta',
    'login',
    'enviar',
]);

function cambiarDdjj(valor) {
    emit('update:aceptoDdjj', valor);
}

function elegirReceta(archivos) {
    emit('elegir-receta', archivos[0] || null);
}

function quitarReceta() {
    emit('elegir-receta', null);
}

function iniciarSesion() {
    emit('login');
}

function enviar() {
    emit('enviar');
}
</script>

<template>
    <aside class="min-w-0">
        <BaseCard variant="surface" padding="md" bordered class="solicitud-entrada rounded-lg shadow-sm">
            <template #header>
                <h2 class="text-balance text-primary">Solicitar este medicamento</h2>
            </template>
            <div class="flex flex-col gap-4">
                <BaseAlert v-if="errorPerfil !== ''" variant="error" :message="errorPerfil" />
                <template v-else-if="sesion === null">
                    <p class="text-pretty text-muted">Iniciá sesión para enviar tu solicitud y coordinar la entrega.</p>
                    <BaseButton type="button" variant="primary" size="lg" class="w-full" @click="iniciarSesion">
                        Iniciar sesión
                    </BaseButton>
                </template>
                <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>
                <template v-else>
                    <BaseAlert
                        v-if="cuentaSuspendida"
                        variant="warning"
                        message="Tu cuenta está suspendida, no podés solicitar medicamentos."
                    />
                    <template v-else>
                        <div v-if="requiereReceta" class="flex flex-col gap-3">
                            <BaseFileDrop
                                id="solicitud-receta"
                                label="Foto de la receta médica"
                                hint="JPG, PNG o WEBP, hasta 5 MB."
                                :multiple="false"
                                :disabled="creando"
                                @select="elegirReceta"
                            />
                            <Transition name="solicitud-campo">
                                <div
                                    v-if="archivoReceta !== null"
                                    class="flex items-center gap-3 rounded-md border border-line bg-surface p-3"
                                >
                                    <p class="min-w-0 flex-1 truncate font-sans text-sm text-foreground">{{ archivoReceta.name }}</p>
                                    <button
                                        type="button"
                                        class="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted transition duration-150 ease-out hover:bg-muted/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
                                        aria-label="Quitar receta"
                                        :disabled="creando"
                                        @click="quitarReceta"
                                    >
                                        <X class="size-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </Transition>
                        </div>
                        <BaseCheckbox
                            id="solicitud-ddjj"
                            :model-value="aceptoDdjj"
                            :disabled="creando"
                            @update:model-value="cambiarDdjj"
                        >
                            Acepto los
                            <RouterLink
                                :to="{ name: 'terminos' }"
                                class="text-primary underline-offset-2 hover:underline"
                                @click.stop
                            >
                                Términos y Condiciones
                            </RouterLink>
                            y la
                            <RouterLink
                                :to="{ name: 'declaracion-jurada' }"
                                class="text-primary underline-offset-2 hover:underline"
                                @click.stop
                            >
                                Declaración Jurada
                            </RouterLink>
                            de ecofarma.
                        </BaseCheckbox>
                    </template>
                    <BaseAlert v-if="errorCrear !== ''" variant="error" :message="errorCrear" />
                    <BaseAlert v-if="mensajeCrear !== ''" variant="success" :message="mensajeCrear" />
                    <BaseButton
                        type="button"
                        variant="primary"
                        size="lg"
                        class="w-full"
                        :loading="creando"
                        :disabled="!puedeSolicitar"
                        @click="enviar"
                    >
                        {{ creando ? 'Enviando...' : 'Enviar solicitud' }}
                    </BaseButton>
                </template>
            </div>
        </BaseCard>
    </aside>
</template>

<style scoped>
.solicitud-entrada {
    animation: solicitud-entrar 420ms ease-out both;
}

@keyframes solicitud-entrar {
    from {
        opacity: 0;
        transform: translateY(0.5rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.solicitud-campo-enter-active,
.solicitud-campo-leave-active {
    transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.solicitud-campo-enter-from,
.solicitud-campo-leave-to {
    opacity: 0;
    transform: translateY(0.35rem);
}

@media (prefers-reduced-motion: reduce) {
    .solicitud-entrada {
        animation: none;
    }

    .solicitud-campo-enter-active,
    .solicitud-campo-leave-active {
        transition: none;
    }
}
</style>
