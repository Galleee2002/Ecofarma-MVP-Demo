<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import FichaMedicamento from '../components/medicamentos/FichaMedicamento.vue';
import PanelSolicitud from '../components/medicamentos/PanelSolicitud.vue';
import { useAuth } from '../composables/useAuth';
import { useMedicamentos } from '../composables/useMedicamentos';
import { useSolicitudes } from '../composables/useSolicitudes';

defineOptions({
    name: 'MedicamentoDetalleView',
});

const route = useRoute();
const router = useRouter();
const { sesion, perfil, errorPerfil } = useAuth();
const { medicamento, cargando, error, cargarMedicamentoPorId } = useMedicamentos();
const { creando, errorCrear, mensajeCrear, crearSolicitud } = useSolicitudes();

const aceptoDdjj = ref(false);
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
    if (requiereReceta.value && archivoReceta.value === null) {
        return false;
    }
    return true;
});

function irALogin() {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
}

function elegirReceta(archivo) {
    archivoReceta.value = archivo;
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
            aceptoDdjj.value = false;
            archivoReceta.value = null;
        }
        cargarMedicamentoPorId(id);
    },
    { immediate: true },
);

async function solicitar() {
    if (sesion.value === null) {
        irALogin();
        return;
    }

    const creada = await crearSolicitud(
        sesion.value.user.id,
        {
            medicamentoId: medicamento.value.id,
            aceptoDdjj: aceptoDdjj.value,
            esParaTercero: false,
            nombreDestinatario: '',
            requiereReceta: requiereReceta.value,
        },
        archivoReceta.value,
    );

    if (creada) {
        aceptoDdjj.value = false;
        archivoReceta.value = null;
    }
}
</script>

<template>
    <main class="pagina">
        <RouterLink
            :to="{ name: 'catalogo' }"
            class="-mx-2 inline-flex min-h-11 w-fit items-center gap-1 self-start rounded-md px-2 font-sans font-semibold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <ChevronLeft :size="18" aria-hidden="true" />
            Volver al catálogo
        </RouterLink>

        <p v-if="cargando" class="text-muted">Cargando medicamento...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-3">
            <BaseAlert variant="error" :message="error" />
            <BaseButton variant="outline" @click="reintentar">Reintentar</BaseButton>
        </div>

        <div
            v-else-if="medicamento !== null"
            class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8"
        >
            <FichaMedicamento class="min-w-0" :medicamento="medicamento" :requiere-receta="requiereReceta" />
            <PanelSolicitud
                class="min-w-0 lg:sticky lg:top-4"
                v-model:acepto-ddjj="aceptoDdjj"
                :archivo-receta="archivoReceta"
                :sesion="sesion"
                :perfil="perfil"
                :requiere-receta="requiereReceta"
                :cuenta-suspendida="cuentaSuspendida"
                :puede-solicitar="puedeSolicitar"
                :creando="creando"
                :error-perfil="errorPerfil"
                :error-crear="errorCrear"
                :mensaje-crear="mensajeCrear"
                @elegir-receta="elegirReceta"
                @login="irALogin"
                @enviar="solicitar"
            />
        </div>
    </main>
</template>
