<script setup>
import { watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronLeft } from '@lucide/vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import FichaMedicamento from '../components/medicamentos/FichaMedicamento.vue';
import { useMedicamentos } from '../composables/useMedicamentos';

defineOptions({
    name: 'MedicamentoDetalleView',
});

const route = useRoute();
const { medicamento, cargando, error, cargarMedicamentoPorId } = useMedicamentos();

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

function reintentar() {
    cargarMedicamentoPorId(route.params.id);
}

watch(
    function () {
        return route.params.id;
    },
    function (id) {
        cargarMedicamentoPorId(id);
    },
    { immediate: true },
);
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

        <div v-else-if="medicamento !== null" class="flex flex-col gap-6">
            <FichaMedicamento class="min-w-0" :medicamento="medicamento" :requiere-receta="requiereReceta" />
            <RouterLink
                :to="{ name: 'medicamento-solicitar', params: { id: medicamento.id } }"
                custom
                v-slot="{ navigate }"
            >
                <BaseButton type="button" variant="primary" size="lg" class="w-full sm:w-auto" @click="navigate">
                    Solicitar
                </BaseButton>
            </RouterLink>
        </div>
    </main>
</template>
