<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, X } from '@lucide/vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCheckbox from '../components/ui/BaseCheckbox.vue';
import BaseFileDrop from '../components/ui/BaseFileDrop.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseTextarea from '../components/ui/BaseTextarea.vue';
import { useAuth } from '../composables/useAuth';
import { useMedicamentos } from '../composables/useMedicamentos';
import { useSolicitudes } from '../composables/useSolicitudes';
import { useModalExito } from '../composables/useModalExito';

defineOptions({
    name: 'SolicitarMedicamentoView',
});

const route = useRoute();
const router = useRouter();
const { sesion, perfil, errorPerfil } = useAuth();
const { medicamento, cargando, error, cargarMedicamentoPorId } = useMedicamentos();
const { creando, errorCrear, crearSolicitud } = useSolicitudes();
const { mostrar: mostrarModalExito } = useModalExito();

const aceptoDdjj = ref(false);
const esParaTercero = ref(false);
const nombreDestinatario = ref('');
const motivo = ref('');
const archivoReceta = ref(null);

const requiereReceta = computed(function () {
    if (medicamento.value === null) {
        return false;
    }
    if (medicamento.value.medicamento_habilitado_id === null) {
        return true;
    }
    const vademecum = medicamento.value.medicamentos_habilitados;
    return vademecum !== null && vademecum.requiere_receta === true;
});

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

const puedeSolicitar = computed(function () {
    if (sesion.value === null || perfil.value === null || cuentaSuspendida.value || aceptoDdjj.value !== true || creando.value) {
        return false;
    }
    if (motivo.value.trim() === '') {
        return false;
    }
    if (esParaTercero.value && nombreDestinatario.value.trim() === '') {
        return false;
    }
    if (requiereReceta.value && archivoReceta.value === null) {
        return false;
    }
    return true;
});

const hintReceta = computed(function () {
    if (requiereReceta.value) {
        return 'Obligatoria. JPG, PNG o WEBP, hasta 5 MB.';
    }
    return 'Opcional. JPG, PNG o WEBP, hasta 5 MB.';
});

function elegirReceta(archivos) {
    archivoReceta.value = archivos[0] || null;
}

function quitarReceta() {
    archivoReceta.value = null;
}

function reiniciarFormulario() {
    aceptoDdjj.value = false;
    esParaTercero.value = false;
    nombreDestinatario.value = '';
    motivo.value = '';
    archivoReceta.value = null;
}

function reintentar() {
    cargarMedicamentoPorId(route.params.id);
}

watch(
    function () {
        return route.params.id;
    },
    function (id, idAnterior) {
        if (idAnterior !== undefined && id !== idAnterior) {
            reiniciarFormulario();
        }
        cargarMedicamentoPorId(id);
    },
    { immediate: true },
);

async function enviar() {
    if (sesion.value === null) {
        router.push({ name: 'login', query: { redirect: route.fullPath } });
        return;
    }

    const creada = await crearSolicitud(
        sesion.value.user.id,
        {
            medicamentoId: medicamento.value.id,
            aceptoDdjj: aceptoDdjj.value,
            esParaTercero: esParaTercero.value,
            nombreDestinatario: nombreDestinatario.value,
            motivo: motivo.value,
            requiereReceta: requiereReceta.value,
        },
        archivoReceta.value,
    );

    if (creada) {
        reiniciarFormulario();
        mostrarModalExito(
            'Solicitud enviada',
            'El código de retiro lo vas a ver en Mis solicitudes, dentro de tu perfil.',
        );
    }
}
</script>

<template>
    <main class="pagina-formulario">
        <RouterLink
            :to="{ name: 'medicamento-detalle', params: { id: route.params.id } }"
            class="-mx-2 inline-flex min-h-11 w-fit items-center gap-1 self-start rounded-md px-2 font-sans font-semibold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <ChevronLeft :size="18" aria-hidden="true" />
            Volver al detalle
        </RouterLink>

        <h1 class="text-balance text-primary">Solicitar medicamento</h1>

        <p v-if="cargando" class="text-muted">Cargando medicamento...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-3">
            <BaseAlert variant="error" :message="error" />
            <BaseButton variant="outline" class="bg-surface" @click="reintentar">Reintentar</BaseButton>
        </div>

        <form
            v-else-if="medicamento !== null"
            class="flex flex-col gap-4"
            @submit.prevent="enviar"
        >
            <p class="text-pretty text-muted">
                {{ medicamento.nombre_comercial }}
                <template v-if="medicamento.concentracion"> · {{ medicamento.concentracion }}</template>
            </p>

            <BaseAlert v-if="errorPerfil !== ''" variant="error" :message="errorPerfil" />
            <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>
            <template v-else>
                <BaseAlert
                    v-if="cuentaSuspendida"
                    variant="warning"
                    message="Tu cuenta está suspendida, no podés solicitar medicamentos."
                />
                <template v-else>
                    <BaseInput
                        id="solicitud-nombre"
                        :model-value="perfil.name || ''"
                        label="Nombre completo"
                        type="text"
                        disabled
                    />
                    <BaseInput
                        id="solicitud-telefono"
                        :model-value="perfil.telefono || ''"
                        label="Número de teléfono"
                        type="tel"
                        disabled
                    />
                    <BaseTextarea
                        id="solicitud-motivo"
                        v-model="motivo"
                        label="Motivo de solicitud"
                        placeholder="Contanos para qué necesitás el medicamento"
                        :rows="4"
                        required
                        :disabled="creando"
                    />
                    <BaseCheckbox
                        id="solicitud-tercero"
                        v-model="esParaTercero"
                        label="Solicito este medicamento para otra persona"
                        :disabled="creando"
                    />
                    <Transition name="solicitud-campo">
                        <BaseInput
                            v-if="esParaTercero"
                            id="solicitud-destinatario"
                            v-model="nombreDestinatario"
                            label="Nombre del destinatario"
                            type="text"
                            placeholder="Juan Pérez"
                            :disabled="creando"
                        />
                    </Transition>
                    <div class="flex flex-col gap-3">
                        <BaseFileDrop
                            id="solicitud-receta"
                            label="Adjuntar receta médica"
                            :hint="hintReceta"
                            :multiple="false"
                            :disabled="creando"
                            @select="elegirReceta"
                        />
                        <Transition name="solicitud-campo">
                            <div
                                v-if="archivoReceta !== null"
                                class="flex items-center gap-3 rounded-md border border-line bg-surface p-3"
                            >
                                <p class="min-w-0 flex-1 truncate font-sans text-sm text-foreground">
                                    {{ archivoReceta.name }}
                                </p>
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
                        v-model="aceptoDdjj"
                        :disabled="creando"
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
            </template>

            <BaseAlert v-if="errorCrear !== ''" variant="error" :message="errorCrear" />

            <BaseButton
                type="submit"
                variant="primary"
                size="lg"
                class="w-full"
                :loading="creando"
                :disabled="!puedeSolicitar"
            >
                {{ creando ? 'Enviando...' : 'Enviar solicitud' }}
            </BaseButton>
        </form>
    </main>
</template>

<style scoped>
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
    .solicitud-campo-enter-active,
    .solicitud-campo-leave-active {
        transition: none;
    }
}
</style>
