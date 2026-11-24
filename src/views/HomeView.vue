<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import HeaderInicio from '../components/layout/HeaderInicio.vue';
import LugaresAdheridos from '../components/layout/LugaresAdheridos.vue';
import MedicamentoCard from '../components/medicamentos/MedicamentoCard.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import { useMedicamentos } from '../composables/useMedicamentos';
import { crearDestinoBusqueda } from '../lib/busquedaCatalogo';

const router = useRouter();
const terminoBusqueda = ref('');

const { cargando, error, medicamentosFiltrados, cargarMedicamentos } = useMedicamentos();

const ultimosMedicamentos = computed(function () {
    return medicamentosFiltrados.value.slice(0, 2);
});

onMounted(cargarMedicamentos);
</script>

<template>
    <main class="pagina">
        <HeaderInicio
            v-model="terminoBusqueda"
            @buscar="router.push(crearDestinoBusqueda(terminoBusqueda))"
        />

        <section class="flex flex-col gap-4" aria-labelledby="ultimos-medicamentos-titulo">
            <div class="flex items-center justify-between gap-3">
                <h2 id="ultimos-medicamentos-titulo" class="text-balance text-foreground">
                    Últimos medicamentos
                </h2>
                <RouterLink
                    :to="{ name: 'recibir' }"
                    class="inline-flex min-h-11 shrink-0 items-center font-sans text-sm font-semibold text-icon transition duration-150 ease-out hover:brightness-110 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                >
                    Ver más
                </RouterLink>
            </div>

            <p v-if="cargando" class="text-muted">Cargando medicamentos...</p>
            <div v-else-if="error !== ''" class="flex flex-col items-start gap-3">
                <BaseAlert variant="error" :message="error" />
                <BaseButton variant="outline" @click="cargarMedicamentos">Reintentar</BaseButton>
            </div>
            <BaseAlert
                v-else-if="ultimosMedicamentos.length === 0"
                variant="info"
                message="No hay medicamentos para mostrar."
            />
            <ul v-else class="flex list-none flex-col gap-3 md:grid md:grid-cols-2">
                <li v-for="medicamento in ultimosMedicamentos" :key="medicamento.id">
                    <MedicamentoCard :medicamento="medicamento" />
                </li>
            </ul>
        </section>

        <LugaresAdheridos />
    </main>
</template>
