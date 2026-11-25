<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseCheckbox from '../components/ui/BaseCheckbox.vue';
import BaseCombobox from '../components/ui/BaseCombobox.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseSelect from '../components/ui/BaseSelect.vue';
import { useAuth } from '../composables/useAuth';
import { useGeoref } from '../composables/useGeoref';

defineOptions({
    name: 'RegistroView',
});

const router = useRouter();
const { cargando, error, registrarse, mostrarAviso } = useAuth();
const {
    opcionesProvincia,
    opcionesLocalidad,
    cargandoProvincias,
    cargandoLocalidades,
    errorGeoref,
    cargarProvincias,
    cargarLocalidadesProvincia,
    localidadEsValida,
    provinciaEsValida,
} = useGeoref();

const paso = ref(1);
const direccionPaso = ref('adelante');
const passwordConfirmacion = ref('');

const datos = ref({
    name: '',
    dni: '',
    telefono: '',
    provincia: '',
    direccion: '',
    localidad: '',
    email: '',
    password: '',
    aceptoDdjj: false,
});

const textoBoton = computed(function () {
    if (paso.value !== 3) {
        return 'Siguiente';
    }
    if (cargando.value) {
        return 'Creando cuenta...';
    }
    return 'Crear cuenta';
});

const nombreTransicion = computed(function () {
    if (direccionPaso.value === 'atras') {
        return 'paso-atras';
    }
    return 'paso-adelante';
});

function mensajeNativo(evento) {
    const campo = evento.target;
    if (campo.id === 'registro-dni' && campo.validity.patternMismatch) {
        campo.setCustomValidity('El DNI debe tener 7 u 8 números.');
    }
}

function actualizarDni(valor) {
    const limpio = String(valor).replace(/\D/g, '').slice(0, 8);
    datos.value.dni = limpio;
    nextTick(function () {
        const input = document.getElementById('registro-dni');
        if (input !== null && input.value !== limpio) {
            input.value = limpio;
        }
    });
}

function sincronizarConfirmacion() {
    const input = document.getElementById('registro-password-confirmacion');
    if (input === null) {
        return;
    }
    if (passwordConfirmacion.value !== '' && passwordConfirmacion.value !== datos.value.password) {
        input.setCustomValidity('Las contraseñas no coinciden.');
        return;
    }
    input.setCustomValidity('');
}

watch(
    [passwordConfirmacion, function () {
        return datos.value.password;
    }],
    function () {
        sincronizarConfirmacion();
    },
);

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

async function validarDomicilio() {
    if (!provinciaEsValida(datos.value.provincia)) {
        error.value = 'Elegí una provincia de la lista.';
        return false;
    }
    if (datos.value.localidad.trim() === '') {
        error.value = 'Completá el barrio o localidad.';
        return false;
    }
    const localidadValida = await localidadEsValida(datos.value.provincia, datos.value.localidad);
    if (!localidadValida) {
        error.value = 'Elegí un barrio o localidad de la lista sugerida.';
        return false;
    }
    if (datos.value.direccion.trim() === '') {
        error.value = 'Completá la calle.';
        return false;
    }
    return true;
}

function continuar() {
    error.value = '';
    direccionPaso.value = 'adelante';
    paso.value += 1;
    if (paso.value === 3) {
        nextTick(sincronizarConfirmacion);
    }
}

function atras() {
    error.value = '';
    if (paso.value > 1) {
        direccionPaso.value = 'atras';
        paso.value -= 1;
    }
}

function reiniciarFormulario() {
    paso.value = 1;
    direccionPaso.value = 'adelante';
    passwordConfirmacion.value = '';
    datos.value = {
        name: '',
        dni: '',
        telefono: '',
        provincia: '',
        direccion: '',
        localidad: '',
        email: '',
        password: '',
        aceptoDdjj: false,
    };
    error.value = '';
}

async function registrar() {
    const domicilioOk = await validarDomicilio();
    if (!domicilioOk) {
        return;
    }
    const registrado = await registrarse(datos.value);
    if (registrado) {
        reiniciarFormulario();
        mostrarAviso('Tu cuenta se creó correctamente. ¡Te damos la bienvenida a ecofarma!', 'exito');
        router.push({ name: 'catalogo' });
    }
}

async function enviar() {
    error.value = '';
    if (paso.value === 2) {
        const domicilioOk = await validarDomicilio();
        if (!domicilioOk) {
            return;
        }
        continuar();
        return;
    }
    if (paso.value < 3) {
        continuar();
        return;
    }
    await registrar();
}
</script>

<template>
    <main class="fondo-trama flex min-h-[calc(100dvh-5rem)] items-start justify-center px-4 py-6 sm:items-center sm:py-10">
        <div class="flex w-full max-w-md flex-col gap-4">
            <RouterLink :to="{ name: 'catalogo' }" class="w-fit text-primary">Volver al catálogo</RouterLink>
            <BaseCard variant="surface" padding="lg" class="w-full rounded-md shadow-md">
                <div class="flex flex-col gap-4">
                    <h1 class="text-primary">Crear cuenta</h1>
                    <p class="text-muted">Completá tus datos para donar o solicitar medicamentos en ecofarma.</p>
                    <Transition name="paso-fade" mode="out-in">
                        <p :key="paso" class="text-sm text-muted">Paso {{ paso }} de 3</p>
                    </Transition>

                    <form class="flex flex-col gap-4" @submit.prevent="enviar" @invalid.capture="mensajeNativo">
                        <div class="-mx-2 -my-1 px-2 py-1">
                        <Transition :name="nombreTransicion" mode="out-in">
                            <div :key="paso" class="flex flex-col gap-4 overflow-visible">
                                <template v-if="paso === 1">
                                    <BaseInput
                                        id="registro-nombre"
                                        v-model="datos.name"
                                        label="Nombre y apellido"
                                        type="text"
                                        placeholder="Juan Pérez"
                                        autocomplete="name"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-dni"
                                        :model-value="datos.dni"
                                        label="DNI"
                                        type="text"
                                        placeholder="12345678"
                                        inputmode="numeric"
                                        autocomplete="off"
                                        maxlength="8"
                                        pattern="[0-9]{7,8}"
                                        required
                                        @update:model-value="actualizarDni"
                                    />
                                    <BaseInput
                                        id="registro-telefono"
                                        v-model="datos.telefono"
                                        label="Teléfono"
                                        type="tel"
                                        placeholder="11 1234-5678"
                                        autocomplete="tel"
                                        required
                                    />
                                </template>

                                <template v-else-if="paso === 2">
                                    <BaseSelect
                                        id="registro-provincia"
                                        :model-value="datos.provincia"
                                        label="Provincia"
                                        placeholder="Elegí una provincia"
                                        :options="opcionesProvincia"
                                        :disabled="cargandoProvincias"
                                        required
                                        @update:model-value="alActualizarProvincia"
                                    />
                                    <BaseCombobox
                                        id="registro-localidad"
                                        :model-value="datos.localidad"
                                        label="Barrio / Localidad"
                                        placeholder="Elegí o escribí para filtrar"
                                        :options="opcionesLocalidad"
                                        :disabled="datos.provincia === '' || cargandoLocalidades"
                                        :hint="cargandoLocalidades ? 'Cargando localidades...' : ''"
                                        required
                                        @update:model-value="alActualizarLocalidad"
                                    />
                                    <BaseInput
                                        id="registro-direccion"
                                        v-model="datos.direccion"
                                        label="Calle"
                                        type="text"
                                        placeholder="Av. Corrientes 1234"
                                        autocomplete="street-address"
                                        required
                                    />
                                    <BaseAlert
                                        v-if="errorGeoref !== ''"
                                        variant="error"
                                        :message="errorGeoref"
                                    />
                                </template>

                                <template v-else>
                                    <BaseInput
                                        id="registro-email"
                                        v-model="datos.email"
                                        label="Email"
                                        type="email"
                                        placeholder="tuemail@gmail.com"
                                        autocomplete="email"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-password"
                                        v-model="datos.password"
                                        label="Contraseña"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        autocomplete="new-password"
                                        minlength="6"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-password-confirmacion"
                                        v-model="passwordConfirmacion"
                                        label="Confirmar contraseña"
                                        type="password"
                                        placeholder="Repetí tu contraseña"
                                        autocomplete="new-password"
                                        required
                                    />
                                    <BaseCheckbox
                                        id="registro-ddjj"
                                        v-model="datos.aceptoDdjj"
                                        required
                                    >
                                        Acepto los
                                        <RouterLink
                                            :to="{ name: 'terminos' }"
                                            class="text-primary underline-offset-2 hover:underline"
                                            @click.stop
                                        >
                                            Términos y Condiciones
                                        </RouterLink>
                                        y la
                                        <RouterLink
                                            :to="{ name: 'declaracion-jurada' }"
                                            class="text-primary underline-offset-2 hover:underline"
                                            @click.stop
                                        >
                                            Declaración Jurada
                                        </RouterLink>
                                        de ecofarma.
                                    </BaseCheckbox>
                                </template>
                            </div>
                        </Transition>
                        </div>

                        <BaseAlert v-if="error !== ''" variant="error" :message="error" />

                        <BaseButton v-if="paso === 1" type="submit" variant="primary" class="w-full">
                            Siguiente
                        </BaseButton>
                        <div v-else class="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                            <BaseButton
                                type="submit"
                                variant="primary"
                                class="w-full min-w-0 sm:order-2"
                                :loading="paso === 3 && cargando"
                            >
                                {{ textoBoton }}
                            </BaseButton>
                            <BaseButton type="button" variant="outline" class="w-full min-w-0 sm:order-1" @click="atras">
                                Atrás
                            </BaseButton>
                        </div>
                    </form>

                    <Transition name="paso-fade">
                        <p v-if="paso === 1" class="text-muted">
                            ¿Ya tenés cuenta?
                            <RouterLink :to="{ name: 'login' }" class="text-primary">Ingresá</RouterLink>
                        </p>
                    </Transition>
                </div>
            </BaseCard>
        </div>
    </main>
</template>

<style scoped>
.paso-adelante-enter-active,
.paso-atras-enter-active {
    transition: opacity 280ms ease-out, transform 280ms ease-out;
}

.paso-adelante-leave-active,
.paso-atras-leave-active {
    transition: opacity 180ms ease-in, transform 180ms ease-in;
}

.paso-adelante-enter-from,
.paso-atras-leave-to {
    transform: translateX(1.25rem);
    opacity: 0;
}

.paso-adelante-leave-to,
.paso-atras-enter-from {
    transform: translateX(-1.25rem);
    opacity: 0;
}

.paso-fade-enter-active,
.paso-fade-leave-active {
    transition: opacity 180ms ease-out;
}

.paso-fade-enter-from,
.paso-fade-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .paso-adelante-enter-active,
    .paso-adelante-leave-active,
    .paso-atras-enter-active,
    .paso-atras-leave-active,
    .paso-fade-enter-active,
    .paso-fade-leave-active {
        transition: none;
    }
}
</style>
