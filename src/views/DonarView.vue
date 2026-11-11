<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { LoaderCircle, X } from '@lucide/vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseCombobox from '../components/ui/BaseCombobox.vue';
import BaseDatePicker from '../components/ui/BaseDatePicker.vue';
import BaseFileDrop from '../components/ui/BaseFileDrop.vue';
import BaseInfoTip from '../components/ui/BaseInfoTip.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseTextarea from '../components/ui/BaseTextarea.vue';
import { useAuth } from '../composables/useAuth';
import { useVademecum } from '../composables/useVademecum';
import { useDonaciones } from '../composables/useDonaciones';
import { useToast } from '../composables/useToast';

defineOptions({
    name: 'DonarView',
});

const MAXIMO_FOTOS = 3;
const DURACION_PREPARACION = 700;
const { sesion, perfil, errorPerfil, mostrarAviso } = useAuth();
const { filas: sugerencias, error: errorSugerencias, cargarSugerencias } = useVademecum();
const { publicando, errorPublicar, mensajePublicar, tipoMensajePublicar, publicarDonacion } = useDonaciones();
const { info: mostrarInfo } = useToast();

const datos = ref({
    nombre_comercial: '',
    principio_activo: '',
    concentracion: '',
    forma_farmaceutica: '',
    cantidad_disponible: '',
    lote: '',
    fecha_vencimiento: '',
    descripcion: '',
});
const fotos = ref([]);
const avisoFotos = ref('');

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

function obtenerFechaDeManiana() {
    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    const anio = maniana.getFullYear();
    const mes = String(maniana.getMonth() + 1).padStart(2, '0');
    const dia = String(maniana.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

const fechaMinima = obtenerFechaDeManiana();

function valoresUnicos(filas, campo) {
    const valores = [];
    for (const fila of filas) {
        const valor = fila[campo];
        if (valor && !valores.includes(valor)) {
            valores.push(valor);
        }
    }
    return valores;
}

function filtrarPorCampo(filas, campo, texto) {
    if (texto === '') {
        return [];
    }

    const coincidentes = [];
    for (const fila of filas) {
        const valor = fila[campo];
        if (valor && valor.toLowerCase() === texto) {
            coincidentes.push(fila);
        }
    }

    return coincidentes;
}

const TEXTO_AYUDA_PRINCIPIO =
    'Componente químico o sustancia responsable del efecto terapéutico. Figura en el envase, habitualmente junto al nombre comercial o en el prospecto.';
const TEXTO_AYUDA_CONCENTRACION =
    'Cantidad de principio activo por unidad de presentación (por ejemplo, 500 mg o 10 mg/ml). Se indica en el frente de la caja o del blíster, junto al nombre del medicamento.';
const TEXTO_AYUDA_FORMA =
    'Modo de presentación del medicamento (comprimidos, cápsulas, jarabe, crema, entre otros). Consta en el frente o en los laterales del envase.';
const TEXTO_AYUDA_NOMBRE =
    'Denominación con la que el medicamento se identifica en el mercado (marca). Es el nombre que suele figurar de forma destacada en el frente del envase.';
const TEXTO_AYUDA_LOTE =
    'Código alfanumérico de fabricación (lote o batch). Se imprime en la caja o el blíster, generalmente junto a la fecha de vencimiento.';

const filasDelPrincipioActivo = computed(function () {
    return filtrarPorCampo(sugerencias.value, 'principio_activo', datos.value.principio_activo.trim().toLowerCase());
});

const filasDeLaConcentracion = computed(function () {
    return filtrarPorCampo(filasDelPrincipioActivo.value, 'concentracion', datos.value.concentracion.trim().toLowerCase());
});

const filasDeLaForma = computed(function () {
    return filtrarPorCampo(filasDeLaConcentracion.value, 'forma_farmaceutica', datos.value.forma_farmaceutica.trim().toLowerCase());
});

const principiosActivos = computed(function () {
    return valoresUnicos(sugerencias.value, 'principio_activo');
});

const concentraciones = computed(function () {
    return valoresUnicos(filasDelPrincipioActivo.value, 'concentracion');
});

const formasFarmaceuticas = computed(function () {
    return valoresUnicos(filasDeLaConcentracion.value, 'forma_farmaceutica');
});

const nombresComerciales = computed(function () {
    return valoresUnicos(filasDeLaForma.value, 'nombre_comercial');
});

const sinMatchVademecum = computed(function () {
    const principio = datos.value.principio_activo.trim();
    const concentracion = datos.value.concentracion.trim();
    const forma = datos.value.forma_farmaceutica.trim();
    if (principio === '' || concentracion === '' || forma === '') {
        return false;
    }
    return filasDeLaForma.value.length === 0;
});

watch(
    function () {
        return datos.value.principio_activo;
    },
    function () {
        datos.value.concentracion = '';
        datos.value.forma_farmaceutica = '';
        datos.value.nombre_comercial = '';
    },
);

watch(
    function () {
        return datos.value.concentracion;
    },
    function () {
        datos.value.forma_farmaceutica = '';
        datos.value.nombre_comercial = '';
    },
);

watch(
    function () {
        return datos.value.forma_farmaceutica;
    },
    function () {
        datos.value.nombre_comercial = '';
    },
);

function yaEstaCargada(nombre) {
    for (const foto of fotos.value) {
        if (foto.archivo.name.toLowerCase() === nombre.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function prefiereMenosMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function formatearTamanio(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    }
    if (bytes < 1024 * 1024) {
        const kb = bytes / 1024;
        if (kb < 10) {
            return kb.toFixed(1) + ' KB';
        }
        return Math.round(kb) + ' KB';
    }
    const mb = bytes / (1024 * 1024);
    if (mb < 10) {
        return mb.toFixed(1) + ' MB';
    }
    return Math.round(mb) + ' MB';
}

function cancelarPreparacion(foto) {
    if (foto.frame !== null) {
        cancelAnimationFrame(foto.frame);
        foto.frame = null;
    }
}

function prepararFoto(foto) {
    if (prefiereMenosMovimiento()) {
        foto.progreso = 100;
        foto.lista = true;
        return;
    }

    const inicio = performance.now();

    function avanzar(ahora) {
        const t = Math.min(1, (ahora - inicio) / DURACION_PREPARACION);
        foto.progreso = Math.round(t * 100);
        if (t < 1) {
            foto.frame = requestAnimationFrame(avanzar);
            return;
        }
        foto.progreso = 100;
        foto.lista = true;
        foto.frame = null;
    }

    foto.frame = requestAnimationFrame(avanzar);
}

function agregarFotos(archivos) {
    avisoFotos.value = '';
    let nombreRepetido = false;

    for (const archivo of archivos) {
        if (yaEstaCargada(archivo.name)) {
            nombreRepetido = true;
            continue;
        }
        if (fotos.value.length < MAXIMO_FOTOS) {
            fotos.value.push({
                archivo: archivo,
                url: URL.createObjectURL(archivo),
                progreso: 0,
                lista: false,
                frame: null,
            });
            prepararFoto(fotos.value[fotos.value.length - 1]);
        } else {
            avisoFotos.value = 'Podés subir hasta 3 fotos. Solo se agregaron las primeras.';
        }
    }

    if (nombreRepetido && avisoFotos.value === '') {
        avisoFotos.value = 'No podés subir dos fotos con el mismo nombre.';
    }
}

function quitarFoto(indice) {
    cancelarPreparacion(fotos.value[indice]);
    URL.revokeObjectURL(fotos.value[indice].url);
    fotos.value.splice(indice, 1);
    avisoFotos.value = '';
}

function limpiarFotos() {
    for (const foto of fotos.value) {
        cancelarPreparacion(foto);
        URL.revokeObjectURL(foto.url);
    }
    fotos.value = [];
}

async function publicar() {
    const archivos = [];
    for (const foto of fotos.value) {
        archivos.push(foto.archivo);
    }

    const publicada = await publicarDonacion(sesion.value.user.id, datos.value, archivos);
    if (publicada) {
        if (tipoMensajePublicar.value === 'exito') {
            mostrarAviso(mensajePublicar.value, 'exito');
        } else {
            mostrarInfo(mensajePublicar.value, { duration: 3000 });
        }
        mensajePublicar.value = '';
        datos.value = {
            nombre_comercial: '',
            principio_activo: '',
            concentracion: '',
            forma_farmaceutica: '',
            cantidad_disponible: '',
            lote: '',
            fecha_vencimiento: '',
            descripcion: '',
        };
        limpiarFotos();
    }
}

onMounted(cargarSugerencias);

onBeforeUnmount(limpiarFotos);
</script>

<template>
    <main class="fondo-trama min-h-[calc(100dvh-5.5rem)]">
        <div class="pagina-media">
            <header class="flex flex-col gap-1">
                <h1 class="text-balance text-primary">Donar un medicamento</h1>
                <p class="text-pretty text-muted">Publicá un medicamento para que otra persona pueda solicitarlo.</p>
            </header>

            <BaseAlert v-if="errorPerfil !== ''" variant="error" :message="errorPerfil" />
            <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>

            <form v-else novalidate @submit.prevent="publicar">
                <BaseCard variant="surface" padding="md" class="rounded-lg shadow-md sm:p-8">
                    <div class="flex flex-col gap-4">
                        <BaseAlert
                            v-if="cuentaSuspendida"
                            variant="warning"
                            message="Tu cuenta está suspendida, no podés publicar donaciones."
                        />
                        <BaseAlert v-if="errorSugerencias !== ''" variant="warning" :message="errorSugerencias" />
                        <BaseAlert
                            v-if="sinMatchVademecum"
                            variant="warning"
                            message="En este MVP solo se publican en el catálogo los medicamentos que coinciden con el vademécum. Usá las sugerencias al escribir."
                        />

                        <div class="flex min-w-0 items-start gap-2">
                            <div class="min-w-0 flex-1">
                                <BaseCombobox
                                    id="donacion-principio"
                                    v-model="datos.principio_activo"
                                    label="Principio activo"
                                    :options="principiosActivos"
                                />
                            </div>
                            <BaseInfoTip
                                class="mt-7"
                                etiqueta="Qué es el principio activo"
                                :texto="TEXTO_AYUDA_PRINCIPIO"
                            />
                        </div>
                        <div class="flex min-w-0 items-start gap-2">
                            <div class="min-w-0 flex-1">
                                <BaseCombobox
                                    id="donacion-concentracion"
                                    v-model="datos.concentracion"
                                    label="Concentración"
                                    :options="concentraciones"
                                />
                            </div>
                            <BaseInfoTip
                                class="mt-7"
                                etiqueta="Dónde encontrar la concentración"
                                :texto="TEXTO_AYUDA_CONCENTRACION"
                            />
                        </div>
                        <div class="flex min-w-0 items-start gap-2">
                            <div class="min-w-0 flex-1">
                                <BaseCombobox
                                    id="donacion-forma"
                                    v-model="datos.forma_farmaceutica"
                                    label="Forma farmacéutica"
                                    :options="formasFarmaceuticas"
                                />
                            </div>
                            <BaseInfoTip
                                class="mt-7"
                                etiqueta="Dónde encontrar la forma farmacéutica"
                                :texto="TEXTO_AYUDA_FORMA"
                            />
                        </div>
                        <div class="flex min-w-0 items-start gap-2">
                            <div class="min-w-0 flex-1">
                                <BaseCombobox
                                    id="donacion-nombre"
                                    v-model="datos.nombre_comercial"
                                    label="Nombre comercial"
                                    :options="nombresComerciales"
                                />
                            </div>
                            <BaseInfoTip
                                class="mt-7"
                                etiqueta="Qué es el nombre comercial"
                                :texto="TEXTO_AYUDA_NOMBRE"
                            />
                        </div>
                        <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                            <BaseInput
                                id="donacion-cantidad"
                                v-model="datos.cantidad_disponible"
                                label="Cantidad"
                                type="number"
                                placeholder="1"
                                min="1"
                                step="1"
                            />
                            <div class="flex min-w-0 items-start gap-2">
                                <div class="min-w-0 flex-1">
                                    <BaseInput
                                        id="donacion-lote"
                                        v-model="datos.lote"
                                        label="Lote"
                                        type="text"
                                        placeholder="ABC123"
                                    />
                                </div>
                                <BaseInfoTip
                                    class="mt-7"
                                    etiqueta="Dónde encontrar el lote"
                                    :texto="TEXTO_AYUDA_LOTE"
                                />
                            </div>
                        </div>
                        <BaseDatePicker
                            id="donacion-vencimiento"
                            v-model="datos.fecha_vencimiento"
                            label="Fecha de vencimiento"
                            :min="fechaMinima"
                        />
                        <BaseTextarea
                            id="donacion-descripcion"
                            v-model="datos.descripcion"
                            label="Descripción (opcional)"
                            placeholder="Estado del envase, observaciones..."
                            :rows="3"
                        />
                        <div class="flex flex-col gap-3">
                            <BaseFileDrop
                                id="donacion-fotos"
                                label="Fotos del envase"
                                hint="JPG, PNG o WEBP, hasta 5 MB. Máximo 3 fotos."
                                :disabled="fotos.length >= MAXIMO_FOTOS"
                                @select="agregarFotos"
                            />
                            <TransitionGroup
                                v-if="fotos.length > 0"
                                name="donacion-fotos"
                                tag="ul"
                                class="flex flex-col gap-3"
                            >
                                <li
                                    v-for="(foto, indice) in fotos"
                                    :key="foto.url"
                                    class="flex items-center gap-3 rounded-md border border-line bg-surface p-3"
                                >
                                    <img
                                        :src="foto.url"
                                        :alt="foto.archivo.name"
                                        class="h-10 w-10 min-h-10 min-w-10 shrink-0 rounded-sm object-cover"
                                    />
                                    <div class="min-w-0 flex-1">
                                        <p class="truncate font-sans text-sm text-foreground">{{ foto.archivo.name }}</p>
                                        <p v-if="!foto.lista" class="mt-0.5 flex items-center gap-1 font-sans text-xs text-muted">
                                            <LoaderCircle class="shrink-0 animate-spin motion-reduce:animate-none" :size="12" aria-hidden="true" />
                                            Preparando...
                                        </p>
                                        <p v-else class="mt-0.5 font-sans text-xs text-muted">
                                            {{ formatearTamanio(foto.archivo.size) }}
                                        </p>
                                        <div
                                            v-if="!foto.lista"
                                            class="mt-2 h-1 w-full overflow-hidden rounded-sm bg-line"
                                            role="progressbar"
                                            :aria-valuenow="foto.progreso"
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                            aria-label="Preparando imagen"
                                        >
                                            <div
                                                class="h-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none"
                                                :style="{ width: foto.progreso + '%' }"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        class="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted transition duration-150 ease-out hover:bg-muted/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none motion-reduce:transition-none"
                                        aria-label="Quitar foto"
                                        @click="quitarFoto(indice)"
                                    >
                                        <X class="size-5" aria-hidden="true" />
                                    </button>
                                </li>
                            </TransitionGroup>
                            <BaseAlert v-if="avisoFotos !== ''" variant="warning" :message="avisoFotos" />
                        </div>
                        <BaseAlert v-if="errorPublicar !== ''" variant="error" :message="errorPublicar" />
                        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <BaseButton
                                type="submit"
                                variant="primary"
                                class="w-full min-w-0 sm:w-auto"
                                :disabled="cuentaSuspendida"
                                :loading="publicando"
                            >
                                {{ publicando ? 'Publicando...' : 'Publicar donación' }}
                            </BaseButton>
                        </div>
                    </div>
                </BaseCard>
            </form>
        </div>
    </main>
</template>

<style>
.donacion-fotos-enter-active,
.donacion-fotos-leave-active {
    transition: opacity 180ms ease-out;
}

.donacion-fotos-move {
    transition: transform 180ms ease-out;
}

.donacion-fotos-enter-from,
.donacion-fotos-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .donacion-fotos-enter-active,
    .donacion-fotos-leave-active,
    .donacion-fotos-move {
        transition: none;
    }
}
</style>
