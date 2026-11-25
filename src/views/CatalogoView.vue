<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMedicamentos } from '../composables/useMedicamentos';
import { usePaginacion } from '../composables/usePaginacion';
import MedicamentoCard from '../components/medicamentos/MedicamentoCard.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import { normalizarBusqueda } from '../lib/busquedaCatalogo';

const route = useRoute();
const { cargando, error, busqueda, filtroReceta, orden, medicamentosFiltrados, cargarMedicamentos } = useMedicamentos();

const medicamentosPorPagina = 4;

const { pagina, total, visibles } = usePaginacion(medicamentosFiltrados, function () {
    return busqueda.value + '|' + filtroReceta.value + '|' + orden.value;
}, medicamentosPorPagina);

const filtrosReceta = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'con_receta', etiqueta: 'Con receta' },
    { valor: 'sin_receta', etiqueta: 'Sin receta' },
];

watch(
    function () {
        return route.query.busqueda;
    },
    function (query) {
        busqueda.value = normalizarBusqueda(query);
    },
    { immediate: true },
);

onMounted(cargarMedicamentos);
</script>

<template>
    <main class="pagina">
        <BaseInput
            id="busqueda-medicamentos"
            v-model="busqueda"
            type="search"
            label="Buscar medicamentos"
            placeholder="Nombre comercial o principio activo"
        />

        <div class="flex flex-wrap gap-2" aria-label="Filtrar medicamentos por receta">
            <BaseButton
                v-for="filtro in filtrosReceta"
                :key="filtro.valor"
                size="sm"
                :variant="filtroReceta === filtro.valor ? 'outline' : 'neutral'"
                :aria-pressed="filtroReceta === filtro.valor"
                @click="filtroReceta = filtro.valor"
            >
                {{ filtro.etiqueta }}
            </BaseButton>
        </div>

        <p v-if="!cargando && error === ''" class="text-muted">{{ total }} medicamentos disponibles</p>
        <p v-if="cargando" class="text-muted">Cargando medicamentos...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-3">
            <BaseAlert variant="error" :message="error" />
            <BaseButton variant="outline" @click="cargarMedicamentos">Reintentar</BaseButton>
        </div>
        <BaseAlert v-else-if="total === 0" variant="info" message="No hay medicamentos para mostrar." />
        <template v-else>
            <ul class="flex list-none flex-col gap-3 md:grid md:grid-cols-2">
                <li v-for="medicamento in visibles" :key="medicamento.id">
                    <MedicamentoCard :medicamento="medicamento" />
                </li>
            </ul>
            <div v-if="total > medicamentosPorPagina" class="flex flex-wrap items-center justify-center gap-3">
                <BaseButton variant="outline" :disabled="pagina === 1" @click="pagina = pagina - 1">
                    Anterior
                </BaseButton>
                <span class="font-sans text-sm text-muted tabular-nums">Página {{ pagina }}</span>
                <BaseButton variant="outline" :disabled="pagina * medicamentosPorPagina >= total" @click="pagina = pagina + 1">
                    Siguiente
                </BaseButton>
            </div>
        </template>
    </main>
</template>
