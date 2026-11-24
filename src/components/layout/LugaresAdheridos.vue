<script setup>
import { reactive } from 'vue';

const lugares = [
    {
        id: 'clinica-eka',
        nombre: 'Clínica EKA',
        direccion: 'Avellaneda 1435, Bernal',
        imagen: '/clinica-eka.jpg',
    },
    {
        id: 'farmacia-calvagni',
        nombre: 'Farmacia Calvagni',
        direccion: 'Viamonte 2393, Lanús',
        imagen: '/farmacia-calvagni.webp',
    },
];

const imagenesRotas = reactive({});

function marcarImagenRota(id) {
    imagenesRotas[id] = true;
}

function imagenVisible(lugar) {
    return imagenesRotas[lugar.id] !== true;
}
</script>

<template>
    <section class="flex flex-col gap-4" aria-labelledby="lugares-adheridos-titulo">
        <div class="flex items-center justify-between gap-3">
            <h2 id="lugares-adheridos-titulo" class="min-w-0 text-balance text-foreground">
                Lugares adheridos
            </h2>
            <RouterLink
                :to="{ name: 'adheridos' }"
                class="inline-flex min-h-11 shrink-0 items-center font-sans text-sm font-semibold text-icon transition duration-150 ease-out hover:brightness-110 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                aria-label="Ver más lugares adheridos"
            >
                Ver más
            </RouterLink>
        </div>

        <ul class="grid max-w-3xl grid-cols-2 gap-3 sm:gap-4">
            <li
                v-for="lugar in lugares"
                :key="lugar.id"
                class="flex min-w-0 flex-col gap-3 rounded-3xl bg-surface p-3 shadow-sm sm:p-4"
            >
                <div class="aspect-[3/2] w-full overflow-hidden rounded-3xl bg-primary-soft">
                    <img
                        v-if="imagenVisible(lugar)"
                        :src="lugar.imagen"
                        :alt="'Fachada de ' + lugar.nombre"
                        class="block size-full scale-[1.02] object-cover"
                        @error="marcarImagenRota(lugar.id)"
                    />
                </div>
                <div class="flex min-w-0 flex-col gap-1">
                    <h3 class="break-words text-balance text-foreground">{{ lugar.nombre }}</h3>
                    <p class="break-words text-sm text-muted">{{ lugar.direccion }}</p>
                </div>
            </li>
        </ul>
    </section>
</template>
