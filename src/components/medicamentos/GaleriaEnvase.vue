<script setup>
import { computed, nextTick, ref, watch } from 'vue';

const props = defineProps({
    fotos: {
        type: Array,
        default: function () {
            return [];
        },
    },
    nombre: {
        type: String,
        default: '',
    },
});

const indiceActivo = ref(0);
const pistaRef = ref(null);

watch(
    function () {
        return props.fotos;
    },
    function () {
        indiceActivo.value = 0;
        nextTick(function () {
            if (pistaRef.value) {
                pistaRef.value.scrollLeft = 0;
            }
        });
    },
);

const hayFotos = computed(function () {
    return props.fotos.length > 0;
});

const hayVarias = computed(function () {
    return props.fotos.length > 1;
});

function elegir(indice) {
    indiceActivo.value = indice;
    const pista = pistaRef.value;
    if (!pista) {
        return;
    }
    pista.scrollTo({
        left: indice * pista.clientWidth,
        behavior: 'smooth',
    });
}

function alScroll() {
    const pista = pistaRef.value;
    if (!pista || pista.clientWidth === 0) {
        return;
    }
    const indice = Math.round(pista.scrollLeft / pista.clientWidth);
    const max = props.fotos.length - 1;
    const siguiente = Math.min(Math.max(indice, 0), max);
    if (siguiente !== indiceActivo.value) {
        indiceActivo.value = siguiente;
    }
}

function textoFoto(indice) {
    return 'Foto ' + (indice + 1) + ' de ' + props.fotos.length + (props.nombre ? ' — ' + props.nombre : '');
}
</script>

<template>
    <div class="flex min-w-0 flex-col gap-3">
        <p v-if="!hayFotos" class="text-pretty text-muted">Este medicamento no tiene fotos del envase.</p>
        <template v-else>
            <div
                ref="pistaRef"
                role="region"
                :aria-roledescription="hayVarias ? 'carrusel' : undefined"
                :aria-label="'Fotos del envase' + (nombre ? ' de ' + nombre : '')"
                class="flex min-w-0 snap-x snap-mandatory overflow-x-auto rounded-lg motion-safe:scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                @scroll.passive="alScroll"
            >
                <div
                    v-for="(foto, indice) in fotos"
                    :key="indice"
                    class="flex w-full shrink-0 snap-start snap-always"
                >
                    <div
                        class="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-surface"
                    >
                        <img
                            :src="foto"
                            :alt="textoFoto(indice)"
                            class="max-h-full max-w-full object-contain"
                            sizes="(min-width: 1024px) 36rem, 100vw"
                            :fetchpriority="indice === 0 ? 'high' : 'auto'"
                            :loading="indice === 0 ? 'eager' : 'lazy'"
                        />
                    </div>
                </div>
            </div>
            <div v-if="hayVarias" class="flex items-center justify-center gap-2" role="tablist" aria-label="Seleccionar foto">
                <button
                    v-for="(foto, indice) in fotos"
                    :key="indice"
                    type="button"
                    role="tab"
                    class="size-2.5 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    :class="indice === indiceActivo ? 'bg-primary' : 'bg-primary-soft'"
                    :aria-label="textoFoto(indice)"
                    :aria-current="indice === indiceActivo ? 'true' : undefined"
                    :aria-selected="indice === indiceActivo"
                    @click="elegir(indice)"
                />
            </div>
        </template>
    </div>
</template>
