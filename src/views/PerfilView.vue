<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseCombobox from '../components/ui/BaseCombobox.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseSelect from '../components/ui/BaseSelect.vue';
import { useAuth } from '../composables/useAuth';
import { useGeoref } from '../composables/useGeoref';
import { usePerfil } from '../composables/usePerfil';
import { useDonaciones } from '../composables/useDonaciones';
import { useSolicitudes } from '../composables/useSolicitudes';

const { sesion, perfil, errorPerfil } = useAuth();
const { cargando: guardando, error: errorGuardar, mensaje: mensajeGuardar, actualizarDatos } = usePerfil();
const {
    opcionesProvincia,
    opcionesLocalidad,
    cargandoProvincias,
    cargandoLocalidades,
    errorGeoref,
    cargarProvincias,
    limpiarLocalidades,
    cargarLocalidadesProvincia,
    localidadEsValida,
    provinciaEsValida,
} = useGeoref();
const { donaciones, cargando: cargandoDonaciones, cargado: donacionesCargadas, error: errorDonaciones, cargarMisDonaciones } = useDonaciones();
const { solicitudes, cargando: cargandoSolicitudes, cargado: solicitudesCargadas, error: errorSolicitudes, cargarMisSolicitudes } = useSolicitudes();
const route = useRoute();
const router = useRouter();

const pestanaActiva = ref('datos');
const datos = ref({
    name: '',
    email: '',
    dni: '',
    telefono: '',
    provincia: '',
    direccion: '',
    localidad: '',
});

const pestanas = [
    { id: 'datos', etiqueta: 'Mis datos' },
    { id: 'donaciones', etiqueta: 'Mis donaciones' },
    { id: 'solicitudes', etiqueta: 'Mis solicitudes' },
];

const textosEstadoDonacion = {
    pendiente_revision: 'En revisión',
    disponible: 'Disponible',
    reservado: 'Reservado',
    entregado: 'Entregado',
    rechazado: 'Rechazado',
};

const variantesEstadoDonacion = {
    pendiente_revision: 'warning',
    disponible: 'success',
    reservado: 'info',
    entregado: 'success',
    rechazado: 'danger',
};

const textosEstadoSolicitud = {
    pendiente_coordinacion: 'Coordinando entrega',
    en_camino: 'En camino',
    completado: 'Entregado',
    cancelado: 'Cancelada',
};

const variantesEstadoSolicitud = {
    pendiente_coordinacion: 'warning',
    en_camino: 'info',
    completado: 'success',
    cancelado: 'danger',
};

const hayCambios = computed(function () {
    const original = datosDesdeCuenta();
    return (
        datos.value.name !== original.name
        || datos.value.email !== original.email
        || datos.value.dni !== original.dni
        || datos.value.telefono !== original.telefono
        || datos.value.provincia !== original.provincia
        || datos.value.direccion !== original.direccion
        || datos.value.localidad !== original.localidad
    );
});

watch(
    function () {
        return perfil.value;
    },
    function (valor) {
        if (valor === null) {
            return;
        }
        aplicarDatos(datosDesdeCuenta());
        if (datos.value.provincia !== '') {
            cargarLocalidadesProvincia(datos.value.provincia);
        }
    },
    { immediate: true },
);

watch(
    function () {
        return route.query.tab;
    },
    function (tab) {
        if (tab === 'donaciones' || tab === 'solicitudes') {
            activarPestana(tab);
        } else {
            activarPestana('datos');
        }
    },
    { immediate: true },
);

watch(
    function () {
        return sesion.value;
    },
    function (valor) {
        if (valor === null) {
            return;
        }
        datos.value.email = textoOVacio(valor.user.email);
    },
    { immediate: true },
);

function textoOVacio(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }
    return String(valor);
}

function datosDesdeCuenta() {
    return {
        name: perfil.value === null ? '' : textoOVacio(perfil.value.name),
        email: sesion.value === null ? '' : textoOVacio(sesion.value.user.email),
        dni: perfil.value === null ? '' : textoOVacio(perfil.value.dni),
        telefono: perfil.value === null ? '' : textoOVacio(perfil.value.telefono),
        provincia: perfil.value === null ? '' : textoOVacio(perfil.value.provincia),
        direccion: perfil.value === null ? '' : textoOVacio(perfil.value.direccion),
        localidad: perfil.value === null ? '' : textoOVacio(perfil.value.localidad),
    };
}

function aplicarDatos(valores) {
    datos.value.name = valores.name;
    datos.value.email = valores.email;
    datos.value.dni = valores.dni;
    datos.value.telefono = valores.telefono;
    datos.value.provincia = valores.provincia;
    datos.value.direccion = valores.direccion;
    datos.value.localidad = valores.localidad;
}

function textoEstadoDonacion(estado) {
    if (textosEstadoDonacion[estado]) {
        return textosEstadoDonacion[estado];
    }
    return estado;
}

function varianteEstadoDonacion(estado) {
    if (variantesEstadoDonacion[estado]) {
        return variantesEstadoDonacion[estado];
    }
    return 'neutral';
}

function textoEstadoSolicitud(estado) {
    if (textosEstadoSolicitud[estado]) {
        return textosEstadoSolicitud[estado];
    }
    return estado;
}

function varianteEstadoSolicitud(estado) {
    if (variantesEstadoSolicitud[estado]) {
        return variantesEstadoSolicitud[estado];
    }
    return 'neutral';
}

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function formatearFechaHora(fecha) {
    return new Date(fecha).toLocaleDateString('es-AR');
}

function recargarDonaciones() {
    cargarMisDonaciones(sesion.value.user.id);
}

function recargarSolicitudes() {
    cargarMisSolicitudes(sesion.value.user.id);
}

function abrirPestana(pestana) {
    activarPestana(pestana);

    const query = { ...route.query };
    if (pestana === 'datos') {
        delete query.tab;
    } else {
        query.tab = pestana;
    }

    if (query.tab !== route.query.tab) {
        router.replace({ query: query });
    }
}

function activarPestana(pestana) {
    pestanaActiva.value = pestana;
    if (pestana === 'donaciones' && !donacionesCargadas.value) {
        recargarDonaciones();
    }
    if (pestana === 'solicitudes' && !solicitudesCargadas.value) {
        recargarSolicitudes();
    }
}

function clasePestana(id) {
    const clases = [
        'inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-full border px-4 py-2 font-sans text-sm font-semibold sm:w-auto',
        'transition duration-150 ease-out motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    ];

    if (pestanaActiva.value === id) {
        clases.push('border-primary bg-primary text-surface shadow-sm');
    } else {
        clases.push('border-line bg-surface text-foreground hover:border-primary hover:text-primary');
    }

    return clases.join(' ');
}

onMounted(function () {
    cargarProvincias();
});

function alActualizarProvincia(valor) {
    const anterior = datos.value.provincia;
    datos.value.provincia = valor;
    if (valor !== anterior) {
        datos.value.localidad = '';
        cargarLocalidadesProvincia(valor);
    }
}

function alActualizarLocalidad(valor) {
    datos.value.localidad = valor;
}

async function guardarDatos() {
    errorGuardar.value = '';
    mensajeGuardar.value = '';

    if (!provinciaEsValida(datos.value.provincia)) {
        errorGuardar.value = 'Elegí una provincia de la lista.';
        return;
    }
    if (datos.value.localidad.trim() === '') {
        errorGuardar.value = 'Completá el barrio o localidad.';
        return;
    }
    const localidadValida = await localidadEsValida(datos.value.provincia, datos.value.localidad);
    if (!localidadValida) {
        errorGuardar.value = 'Elegí un barrio o localidad de la lista sugerida.';
        return;
    }

    await actualizarDatos(datos.value);
}

function cancelarCambios() {
    if (guardando.value) {
        return;
    }
    errorGuardar.value = '';
    mensajeGuardar.value = '';
    limpiarLocalidades();
    aplicarDatos(datosDesdeCuenta());
}

function claseEnlaceChat() {
    return [
        'inline-flex min-h-10 w-fit items-center justify-center rounded-md px-0 font-sans font-semibold text-primary',
        'transition duration-150 ease-out hover:text-secondary motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
    ].join(' ');
}
</script>

<template>
    <main class="min-h-[calc(100dvh-5.5rem)] bg-background">
        <div class="pagina">
            <header class="perfil-entrada flex flex-col gap-1">
                <h1 class="text-balance text-primary">Mi perfil</h1>
                <p class="text-pretty text-muted">Gestioná tus datos personales y actividad en la plataforma.</p>
            </header>

            <BaseAlert v-if="errorPerfil !== ''" class="perfil-entrada perfil-entrada-2" variant="error" :message="errorPerfil" />
            <p v-else-if="perfil === null" class="perfil-entrada perfil-entrada-2 text-muted">Cargando tus datos...</p>

            <template v-else>
                <div
                    class="perfil-entrada perfil-entrada-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                    role="tablist"
                    aria-label="Secciones del perfil"
                >
                    <button
                        v-for="pestana in pestanas"
                        :id="'perfil-tab-' + pestana.id"
                        :key="pestana.id"
                        type="button"
                        role="tab"
                        :aria-selected="pestanaActiva === pestana.id ? 'true' : 'false'"
                        :aria-controls="'perfil-panel-' + pestana.id"
                        :class="clasePestana(pestana.id)"
                        @click="abrirPestana(pestana.id)"
                    >
                        {{ pestana.etiqueta }}
                    </button>
                </div>

                <Transition name="perfil-panel" mode="out-in">
                    <form
                        v-if="pestanaActiva === 'datos'"
                        :id="'perfil-panel-datos'"
                        role="tabpanel"
                        aria-labelledby="perfil-tab-datos"
                        novalidate
                        @submit.prevent="guardarDatos"
                    >
                        <BaseCard variant="surface" padding="md" class="rounded-lg shadow-md sm:p-8">
                            <div class="flex flex-col gap-6">
                                <div class="flex flex-col gap-1">
                                    <h2 class="text-primary">Mis datos personales</h2>
                                    <p class="text-pretty text-muted">Actualizá tu información de contacto y ubicación.</p>
                                </div>

                                <div class="flex flex-col gap-4">
                                    <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                                        <BaseInput
                                            id="perfil-nombre"
                                            v-model="datos.name"
                                            label="Nombre"
                                            type="text"
                                            placeholder="Juan Pérez"
                                            autocomplete="name"
                                        />
                                        <BaseInput
                                            id="perfil-email"
                                            v-model="datos.email"
                                            label="Email"
                                            type="email"
                                            placeholder="tuemail@gmail.com"
                                            autocomplete="email"
                                        />
                                        <BaseInput
                                            id="perfil-dni"
                                            v-model="datos.dni"
                                            label="DNI"
                                            type="text"
                                            placeholder="12345678"
                                            inputmode="numeric"
                                        />
                                        <BaseInput
                                            id="perfil-telefono"
                                            v-model="datos.telefono"
                                            label="Teléfono"
                                            type="tel"
                                            placeholder="11 1234-5678"
                                            autocomplete="tel"
                                        />
                                    </div>
                                    <BaseSelect
                                        id="perfil-provincia"
                                        :model-value="datos.provincia"
                                        label="Provincia"
                                        placeholder="Elegí una provincia"
                                        :options="opcionesProvincia"
                                        :disabled="cargandoProvincias"
                                        @update:model-value="alActualizarProvincia"
                                    />
                                    <BaseCombobox
                                        id="perfil-localidad"
                                        :model-value="datos.localidad"
                                        label="Barrio / Localidad"
                                        placeholder="Elegí o escribí para filtrar"
                                        :options="opcionesLocalidad"
                                        :disabled="datos.provincia === '' || cargandoLocalidades"
                                        :hint="cargandoLocalidades ? 'Cargando localidades...' : ''"
                                        @update:model-value="alActualizarLocalidad"
                                    />
                                    <BaseInput
                                        id="perfil-direccion"
                                        v-model="datos.direccion"
                                        label="Calle"
                                        type="text"
                                        placeholder="Av. Corrientes 1234"
                                        autocomplete="street-address"
                                    />
                                </div>

                                <BaseAlert
                                    v-if="errorGeoref !== ''"
                                    variant="error"
                                    :message="errorGeoref"
                                />
                                <BaseAlert v-if="errorGuardar !== ''" variant="error" :message="errorGuardar" />
                                <BaseAlert v-if="mensajeGuardar !== ''" variant="success" :message="mensajeGuardar" />

                                <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                    <BaseButton
                                        type="submit"
                                        variant="primary"
                                        class="w-full min-w-0 sm:order-2 sm:w-auto"
                                        :loading="guardando"
                                    >
                                        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                                    </BaseButton>
                                    <BaseButton
                                        type="button"
                                        variant="neutral"
                                        class="w-full min-w-0 sm:order-1 sm:w-auto"
                                        :disabled="guardando || !hayCambios"
                                        @click="cancelarCambios"
                                    >
                                        Cancelar
                                    </BaseButton>
                                </div>
                            </div>
                        </BaseCard>
                    </form>

                    <div
                        v-else-if="pestanaActiva === 'donaciones'"
                        id="perfil-panel-donaciones"
                        role="tabpanel"
                        aria-labelledby="perfil-tab-donaciones"
                    >
                        <BaseCard variant="surface" padding="md" class="rounded-lg shadow-md sm:p-8">
                            <div class="flex flex-col gap-6">
                                <div class="flex flex-col gap-1">
                                    <h2 class="text-primary">Mis donaciones</h2>
                                    <p class="text-pretty text-muted">Revisá el estado de lo que publicaste.</p>
                                </div>

                                <p v-if="cargandoDonaciones" class="text-muted">Cargando tus donaciones...</p>
                                <div v-else-if="errorDonaciones !== ''" class="flex flex-col items-start gap-3">
                                    <BaseAlert variant="error" :message="errorDonaciones" />
                                    <BaseButton variant="outline" @click="recargarDonaciones">Reintentar</BaseButton>
                                </div>
                                <BaseAlert
                                    v-else-if="donaciones.length === 0"
                                    variant="info"
                                    message="Todavía no publicaste donaciones."
                                />
                                <TransitionGroup v-else name="perfil-lista" tag="ul" class="flex flex-col gap-3">
                                <li
                                    v-for="donacion in donaciones"
                                    :key="donacion.id"
                                    class="rounded-md border border-line bg-surface p-4 shadow-sm"
                                >
                                    <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div class="min-w-0 flex-1">
                                            <h3 class="text-balance break-words text-primary">{{ donacion.nombre_comercial }}</h3>
                                            <p class="mt-1 text-sm text-muted">
                                                {{ donacion.principio_activo }} {{ donacion.concentracion }}
                                            </p>
                                            <p class="text-sm text-muted">Cantidad: {{ donacion.cantidad_disponible }}</p>
                                            <p class="text-sm text-icon">Vence: {{ formatearFecha(donacion.fecha_vencimiento) }}</p>
                                        </div>
                                        <BaseBadge class="self-start" :variant="varianteEstadoDonacion(donacion.estado)" size="sm">
                                            {{ textoEstadoDonacion(donacion.estado) }}
                                        </BaseBadge>
                                    </div>
                                    <BaseAlert
                                        v-if="donacion.estado === 'rechazado' && donacion.motivo_rechazo"
                                        class="mt-3"
                                        variant="warning"
                                        :message="'Motivo del rechazo: ' + donacion.motivo_rechazo"
                                    />
                                    <RouterLink
                                        v-if="donacion.estado === 'reservado' && donacion.solicitud_id"
                                        :to="{ name: 'chat-solicitud', params: { solicitudId: donacion.solicitud_id } }"
                                        :class="['mt-3', claseEnlaceChat()]"
                                    >
                                        Abrir chat
                                    </RouterLink>
                                </li>
                                </TransitionGroup>
                            </div>
                        </BaseCard>
                    </div>

                    <div
                        v-else
                        id="perfil-panel-solicitudes"
                        role="tabpanel"
                        aria-labelledby="perfil-tab-solicitudes"
                    >
                        <BaseCard variant="surface" padding="md" class="rounded-lg shadow-md sm:p-8">
                            <div class="flex flex-col gap-6">
                                <div class="flex flex-col gap-1">
                                    <h2 class="text-primary">Mis solicitudes</h2>
                                    <p class="text-pretty text-muted">Seguí los pedidos que hiciste.</p>
                                </div>

                                <p v-if="cargandoSolicitudes" class="text-muted">Cargando tus solicitudes...</p>
                                <div v-else-if="errorSolicitudes !== ''" class="flex flex-col items-start gap-3">
                                    <BaseAlert variant="error" :message="errorSolicitudes" />
                                    <BaseButton variant="outline" @click="recargarSolicitudes">Reintentar</BaseButton>
                                </div>
                                <BaseAlert
                                    v-else-if="solicitudes.length === 0"
                                    variant="info"
                                    message="Todavía no hiciste solicitudes."
                                />
                                <TransitionGroup v-else name="perfil-lista" tag="ul" class="flex flex-col gap-3">
                                <li
                                    v-for="solicitud in solicitudes"
                                    :key="solicitud.id"
                                    class="rounded-md border border-line bg-surface p-4 shadow-sm"
                                >
                                    <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div class="min-w-0 flex-1">
                                            <h3 v-if="solicitud.medicamentos" class="text-balance break-words text-primary">
                                                {{ solicitud.medicamentos.nombre_comercial }}
                                            </h3>
                                            <p v-if="solicitud.medicamentos" class="mt-1 text-sm text-muted">
                                                {{ solicitud.medicamentos.principio_activo }}
                                            </p>
                                            <p class="text-sm text-muted">Solicitado el {{ formatearFechaHora(solicitud.created_at) }}</p>
                                            <p v-if="solicitud.fecha_entrega" class="text-sm text-icon">
                                                Entregado el {{ formatearFechaHora(solicitud.fecha_entrega) }}
                                            </p>
                                            <p v-if="solicitud.codigo" class="text-sm">
                                                Código de retiro:
                                                <strong class="tabular-nums">{{ solicitud.codigo }}</strong>
                                            </p>
                                        </div>
                                        <BaseBadge class="self-start" :variant="varianteEstadoSolicitud(solicitud.estado)" size="sm">
                                            {{ textoEstadoSolicitud(solicitud.estado) }}
                                        </BaseBadge>
                                    </div>
                                    <BaseAlert
                                        v-if="solicitud.errorCodigo"
                                        class="mt-3"
                                        variant="warning"
                                        message="Código no disponible. Recargá la página para intentar de nuevo."
                                    />
                                    <RouterLink
                                        v-if="solicitud.estado === 'pendiente_coordinacion' || solicitud.estado === 'en_camino'"
                                        :to="{ name: 'chat-solicitud', params: { solicitudId: solicitud.id } }"
                                        :class="['mt-3', claseEnlaceChat()]"
                                    >
                                        Abrir chat
                                    </RouterLink>
                                </li>
                                </TransitionGroup>
                            </div>
                        </BaseCard>
                    </div>
                </Transition>
            </template>
        </div>
    </main>
</template>

<style scoped>
.perfil-entrada {
    animation: perfil-entrar 420ms ease-out both;
}

.perfil-entrada-2 {
    animation-delay: 70ms;
}

@keyframes perfil-entrar {
    from {
        opacity: 0;
        transform: translateY(0.5rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.perfil-panel-enter-active,
.perfil-panel-leave-active,
.perfil-lista-enter-active,
.perfil-lista-leave-active {
    transition: opacity 180ms ease-out;
}

.perfil-lista-move {
    transition: transform 180ms ease-out;
}

.perfil-panel-enter-from,
.perfil-panel-leave-to,
.perfil-lista-enter-from,
.perfil-lista-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .perfil-entrada,
    .perfil-entrada-2 {
        animation: none;
    }

    .perfil-panel-enter-active,
    .perfil-panel-leave-active,
    .perfil-lista-enter-active,
    .perfil-lista-leave-active,
    .perfil-lista-move {
        transition: none;
    }
}
</style>
