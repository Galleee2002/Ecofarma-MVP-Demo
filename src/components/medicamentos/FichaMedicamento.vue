<script setup>
import { computed } from 'vue';
import { Barcode, Calendar, FileText, Package, Pill } from '@lucide/vue';
import BaseBadge from '../ui/BaseBadge.vue';
import GaleriaEnvase from './GaleriaEnvase.vue';

const props = defineProps({
    medicamento: {
        type: Object,
        required: true,
    },
    requiereReceta: {
        type: Boolean,
        default: false,
    },
});

const fotos = computed(function () {
    if (!Array.isArray(props.medicamento.fotos_envase)) {
        return [];
    }
    return props.medicamento.fotos_envase;
});

const formaFarmaceutica = computed(function () {
    return props.medicamento.forma_farmaceutica || 'No informada';
});

const lote = computed(function () {
    return props.medicamento.lote || 'No informado';
});

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}
</script>

<template>
    <article class="flex min-w-0 flex-col gap-6">
        <header class="flex flex-col gap-2">
            <div class="flex flex-wrap items-start gap-2 sm:justify-between">
                <h1 class="text-balance font-heading text-primary">{{ medicamento.nombre_comercial }}</h1>
                <BaseBadge class="self-start" size="sm" :variant="requiereReceta ? 'warning' : 'success'">
                    {{ requiereReceta ? 'Con receta' : 'Sin receta' }}
                </BaseBadge>
            </div>
            <p class="text-pretty text-muted">{{ medicamento.principio_activo }} {{ medicamento.concentracion }}</p>
        </header>

        <GaleriaEnvase :fotos="fotos" :nombre="medicamento.nombre_comercial" />

        <dl class="grid min-w-0 grid-cols-2 gap-3">
            <div class="flex min-w-0 flex-col items-center gap-1.5 text-center">
                <span class="text-primary" aria-hidden="true">
                    <Pill :size="20" />
                </span>
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Forma farmacéutica</dt>
                    <dd class="font-heading text-base text-foreground">{{ formaFarmaceutica }}</dd>
                </div>
            </div>
            <div class="flex min-w-0 flex-col items-center gap-1.5 text-center">
                <span class="text-primary" aria-hidden="true">
                    <Package :size="20" />
                </span>
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Cantidad</dt>
                    <dd class="font-heading text-base text-foreground">{{ medicamento.cantidad_disponible }}</dd>
                </div>
            </div>
            <div class="flex min-w-0 flex-col items-center gap-1.5 text-center">
                <span class="text-primary" aria-hidden="true">
                    <Calendar :size="20" />
                </span>
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Vencimiento</dt>
                    <dd class="font-heading text-base text-foreground">{{ formatearFecha(medicamento.fecha_vencimiento) }}</dd>
                </div>
            </div>
            <div class="flex min-w-0 flex-col items-center gap-1.5 text-center">
                <span class="text-primary" aria-hidden="true">
                    <Barcode :size="20" />
                </span>
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Lote</dt>
                    <dd class="font-heading text-base text-foreground">{{ lote }}</dd>
                </div>
            </div>
        </dl>

        <div
            v-if="medicamento.descripcion"
            class="flex items-start gap-3 rounded-lg bg-primary-soft/60 p-4"
        >
            <FileText class="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p class="min-w-0 text-pretty text-foreground">{{ medicamento.descripcion }}</p>
        </div>
    </article>
</template>
