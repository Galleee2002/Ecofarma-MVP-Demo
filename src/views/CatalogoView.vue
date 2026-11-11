<script setup>
import { onMounted } from 'vue';
import { useMedicamentos } from '../composables/useMedicamentos';
import { usePaginacion } from '../composables/usePaginacion';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseSelect from '../components/ui/BaseSelect.vue';

const {
    cargando,
    error,
    busqueda,
    filtroReceta,
    orden,
    medicamentosFiltrados,
    cargarMedicamentos,
} = useMedicamentos();

const { pagina, total, visibles } = usePaginacion(medicamentosFiltrados, function () {
    return busqueda.value + '|' + filtroReceta.value + '|' + orden.value;
});

const { opcionesOrden, filtrosReceta, requiereReceta } = useCatalogoFiltros();

function useCatalogoFiltros() {
    const opcionesOrden = [
        { value: 'recientes', label: 'Más recientes' },
        { value: 'vencimiento', label: 'Próximos a vencer' },
    ];

    const filtrosReceta = [
        { valor: 'todos', etiqueta: 'Todos' },
        { valor: 'con_receta', etiqueta: 'Con receta' },
        { valor: 'sin_receta', etiqueta: 'Sin receta' },
    ];

    function requiereReceta(medicamento) {
        return medicamento.medicamentos_habilitados?.requiere_receta === true;
    }

    return {
        opcionesOrden,
        filtrosReceta,
        requiereReceta,
    };
}

onMounted(cargarMedicamentos);
</script>

<template>
    <main class="pagina">
        <header class="flex flex-col gap-1">
            <h1 class="text-balance text-primary">Catálogo de medicamentos</h1>
            <p class="text-pretty text-muted">Explorá los medicamentos donados disponibles para solicitar.</p>
        </header>

        <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
                id="catalogo-busqueda"
                v-model="busqueda"
                label="Buscar"
                type="search"
                placeholder="Nombre o principio activo"
            />
            <BaseSelect
                id="catalogo-orden"
                v-model="orden"
                label="Ordenar"
                :options="opcionesOrden"
            />
        </div>

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
            <ul class="flex list-none flex-col gap-4">
                <li v-for="medicamento in visibles" :key="medicamento.id">
                    <BaseCard variant="surface" padding="md" bordered class="rounded-lg shadow-sm">
                        <template #header>
                            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <h2 class="text-balance text-primary">{{ medicamento.nombre_comercial }}</h2>
                                <BaseBadge class="self-start" size="sm" :variant="requiereReceta(medicamento) ? 'warning' : 'success'">
                                    {{ requiereReceta(medicamento) ? 'Con receta' : 'Sin receta' }}
                                </BaseBadge>
                            </div>
                        </template>
                        <p>{{ medicamento.principio_activo }} {{ medicamento.concentracion }}</p>
                        <p class="text-sm text-muted">{{ medicamento.forma_farmaceutica }} · cantidad {{ medicamento.cantidad_disponible }}</p>
                        <template #footer>
                            <RouterLink :to="'/medicamento/' + medicamento.id" class="font-semibold text-primary">Ver detalle</RouterLink>
                        </template>
                    </BaseCard>
                </li>
            </ul>
            <div v-if="total > 15" class="flex flex-wrap items-center gap-3">
                <BaseButton variant="outline" :disabled="pagina === 1" @click="pagina = pagina - 1">
                    Anterior
                </BaseButton>
                <span class="font-sans text-sm text-muted tabular-nums">Página {{ pagina }}</span>
                <BaseButton variant="outline" :disabled="pagina * 15 >= total" @click="pagina = pagina + 1">
                    Siguiente
                </BaseButton>
            </div>
        </template>
    </main>
</template>
