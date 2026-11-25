<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';
import BaseCard from '../ui/BaseCard.vue';
import BaseStatus from '../ui/BaseStatus.vue';

const props = defineProps({
    medicamento: {
        type: Object,
        required: true,
    },
});

const router = useRouter();

const textosEstado = {
    pendiente_revision: 'En revisión',
    disponible: 'Disponible',
    reservado: 'Reservado',
    entregado: 'Entregado',
    rechazado: 'Rechazado',
};

const variantesEstado = {
    pendiente_revision: 'warning',
    disponible: 'success',
    reservado: 'info',
    entregado: 'success',
    rechazado: 'danger',
};

const etiquetaEstado = computed(function () {
    return textosEstado[props.medicamento.estado] || props.medicamento.estado;
});

const varianteEstado = computed(function () {
    return variantesEstado[props.medicamento.estado] || 'info';
});

const fechaPublicacion = computed(function () {
    if (!props.medicamento.created_at) {
        return '';
    }
    return new Date(props.medicamento.created_at).toLocaleDateString('es-AR');
});

function verDetalle() {
    router.push({ name: 'medicamento-detalle', params: { id: props.medicamento.id } });
}

function solicitar() {
    router.push({ name: 'medicamento-solicitar', params: { id: props.medicamento.id } });
}
</script>

<template>
    <BaseCard variant="surface" padding="none" bordered class="rounded-lg p-5 shadow-sm">
        <div class="flex flex-col gap-3">
            <h2 class="text-lg text-balance text-primary">{{ medicamento.nombre_comercial }}</h2>
            <p class="text-sm text-muted">
                {{ medicamento.concentracion }} · cantidad {{ medicamento.cantidad_disponible }}<template v-if="fechaPublicacion !== ''"> · {{ fechaPublicacion }}</template>
            </p>
            <BaseStatus :variant="varianteEstado">
                {{ etiquetaEstado }}
            </BaseStatus>
            <div class="flex flex-wrap items-center justify-start gap-3">
                <BaseButton
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="verDetalle"
                >
                    Ver detalle
                </BaseButton>
                <BaseButton
                    type="button"
                    variant="primary"
                    size="sm"
                    @click="solicitar"
                >
                    Solicitar
                </BaseButton>
            </div>
        </div>
    </BaseCard>
</template>
