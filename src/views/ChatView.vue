<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { LoaderCircle, Send } from '@lucide/vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useMensajes } from '../composables/useMensajes';
import { useSolicitudes } from '../composables/useSolicitudes';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseDatePicker from '../components/ui/BaseDatePicker.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseModal from '../components/ui/BaseModal.vue';

const route = useRoute();
const { sesion, perfil } = useAuth();
const { mensajes, solicitud, nombreOtro, cargando, enviando, error, errorEnvio, cargarChat, enviarMensaje } = useMensajes();
const { confirmando, errorConfirmar, mensajeConfirmar, cancelando, errorCancelar, mensajeCancelar, confirmarEntrega, cancelarSolicitud } =
    useSolicitudes();

const { cuentaSuspendida, puedeEscribir, esDonante, tituloChat, esPropio, formatearFecha, claseVolver } = useChatEstado(
    sesion,
    perfil,
    solicitud,
);
const { hilo } = useChatScroll(mensajes, cargando);
const { texto, alEnviar } = useChatFormulario(route, sesion, enviarMensaje);
const { dia, hora, lugar, errorEncuentro, fechaMinima, alProponer } = usePropuestaEncuentro(route, sesion, enviarMensaje);
const { codigo, codigoValido, confirmarCancelacion, alConfirmar, alCancelar } = useChatAcciones(
    route,
    sesion,
    cargarChat,
    confirmarEntrega,
    cancelarSolicitud,
);

function useChatEstado(sesion, perfil, solicitud) {
    const cuentaSuspendida = computed(function () {
        return perfil.value !== null && perfil.value.is_validado === false;
    });

    const puedeEscribir = computed(function () {
        if (cuentaSuspendida.value || solicitud.value === null) {
            return false;
        }
        return solicitud.value.estado === 'pendiente_coordinacion' || solicitud.value.estado === 'en_camino';
    });

    const esDonante = computed(function () {
        if (solicitud.value === null || solicitud.value.medicamentos === null || sesion.value === null) {
            return false;
        }
        return solicitud.value.medicamentos.user_id === sesion.value.user.id;
    });

    const tituloChat = computed(function () {
        if (solicitud.value !== null && solicitud.value.medicamentos !== null) {
            return solicitud.value.medicamentos.nombre_comercial;
        }
        return 'Chat';
    });

    function esPropio(mensaje) {
        return mensaje.user_id === sesion.value.user.id;
    }

    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleString('es-AR');
    }

    function claseVolver() {
        return [
            'inline-flex min-h-11 w-fit items-center font-sans font-semibold text-primary',
            'transition duration-150 ease-out hover:text-secondary motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        ].join(' ');
    }

    return {
        cuentaSuspendida,
        puedeEscribir,
        esDonante,
        tituloChat,
        esPropio,
        formatearFecha,
        claseVolver,
    };
}

function useChatScroll(mensajes, cargando) {
    const hilo = ref(null);

    function irAlFinal() {
        nextTick(function () {
            const nodo = hilo.value;
            if (nodo === null) {
                return;
            }
            const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            nodo.scrollTo({
                top: nodo.scrollHeight,
                behavior: reducido ? 'auto' : 'smooth',
            });
        });
    }

    watch(
        function () {
            return mensajes.value.length;
        },
        function () {
            irAlFinal();
        },
    );

    watch(cargando, function (valor) {
        if (!valor) {
            irAlFinal();
        }
    });

    return {
        hilo,
    };
}

function useChatFormulario(route, sesion, enviarMensaje) {
    const texto = ref('');

    async function alEnviar() {
        const ok = await enviarMensaje(route.params.solicitudId, sesion.value.user.id, texto.value);
        if (ok) {
            texto.value = '';
        }
    }

    return {
        texto,
        alEnviar,
    };
}

function usePropuestaEncuentro(route, sesion, enviarMensaje) {
    const dia = ref('');
    const hora = ref('');
    const lugar = ref('');
    const errorEncuentro = ref('');

    function fechaMinima() {
        const maniana = new Date();
        maniana.setDate(maniana.getDate() + 1);
        const anio = maniana.getFullYear();
        const mes = String(maniana.getMonth() + 1).padStart(2, '0');
        const diaManiana = String(maniana.getDate()).padStart(2, '0');
        return anio + '-' + mes + '-' + diaManiana;
    }

    function formatearDia(valor) {
        const partes = valor.split('-');
        return partes[2] + '/' + partes[1] + '/' + partes[0];
    }

    async function alProponer() {
        errorEncuentro.value = '';
        const lugarTexto = lugar.value.trim();

        if (dia.value === '' || hora.value === '' || lugarTexto === '') {
            errorEncuentro.value = 'Completá el día, la hora y el lugar del encuentro.';
            return;
        }

        if (dia.value < fechaMinima()) {
            errorEncuentro.value = 'El día del encuentro tiene que ser a partir de mañana.';
            return;
        }

        const mensaje = 'Propongo encontrarnos el ' + formatearDia(dia.value) + ' a las ' + hora.value + ' en ' + lugarTexto + '.';
        const ok = await enviarMensaje(route.params.solicitudId, sesion.value.user.id, mensaje);
        if (ok) {
            dia.value = '';
            hora.value = '';
            lugar.value = '';
        }
    }

    return {
        dia,
        hora,
        lugar,
        errorEncuentro,
        fechaMinima,
        alProponer,
    };
}

function useChatAcciones(route, sesion, cargarChat, confirmarEntrega, cancelarSolicitud) {
    const codigo = ref('');
    const confirmarCancelacion = ref(false);
    const codigoValido = computed(function () {
        return /^[0-9]{6}$/.test(codigo.value.trim());
    });

    async function alConfirmar() {
        const ok = await confirmarEntrega(route.params.solicitudId, codigo.value);
        if (ok) {
            codigo.value = '';
            await cargarChat(route.params.solicitudId, sesion.value.user.id);
        }
    }

    async function alCancelar() {
        const ok = await cancelarSolicitud(route.params.solicitudId);
        if (ok) {
            confirmarCancelacion.value = false;
            await cargarChat(route.params.solicitudId, sesion.value.user.id);
        }
    }

    return {
        codigo,
        codigoValido,
        confirmarCancelacion,
        alConfirmar,
        alCancelar,
    };
}

onMounted(function () {
    cargarChat(route.params.solicitudId, sesion.value.user.id);
});
</script>

<template>
    <main class="pagina">
        <RouterLink :to="{ name: 'perfil' }" :class="['chat-entrada', claseVolver()]">Volver al perfil</RouterLink>

        <BaseAlert v-if="mensajeConfirmar !== ''" variant="success" :message="mensajeConfirmar" />
        <BaseAlert v-if="mensajeCancelar !== ''" variant="success" :message="mensajeCancelar" />
        <p v-if="cargando" class="text-muted">Cargando la conversación...</p>
        <BaseAlert v-else-if="error !== ''" variant="error" :message="error" />

        <template v-else-if="solicitud !== null">
            <header class="chat-entrada flex flex-col gap-1">
                <h1 class="text-balance text-primary">{{ tituloChat }}</h1>
                <p v-if="nombreOtro !== ''" class="text-muted">Con {{ nombreOtro }}</p>
            </header>

            <BaseAlert
                v-if="cuentaSuspendida"
                variant="warning"
                message="Tu cuenta está suspendida y no podés enviar mensajes."
            />
            <BaseAlert
                v-else-if="!puedeEscribir"
                variant="info"
                message="Esta solicitud ya no admite mensajes nuevos. Podés leer los anteriores."
            />

            <BaseAlert class="chat-entrada-2" variant="warning" title="Normas de convivencia">
                <ul class="list-disc space-y-1 pl-5 text-foreground">
                    <li>Coordiná el encuentro en un lugar público.</li>
                    <li>No compartas por el chat tu DNI ni la dirección de tu casa.</li>
                    <li>Al recibir el medicamento, revisá el envase y la fecha de vencimiento.</li>
                    <li>Tratá con respeto a la otra persona.</li>
                </ul>
            </BaseAlert>

            <BaseCard variant="surface" padding="md" bordered class="rounded-lg shadow-sm">
                <template #header>
                    <h2 class="text-balance text-primary">Proponer encuentro</h2>
                </template>
                <form id="form-encuentro" class="flex flex-col gap-3" @submit.prevent="alProponer">
                    <BaseAlert v-if="errorEncuentro !== ''" variant="error" :message="errorEncuentro" />
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <BaseDatePicker
                            id="encuentro-dia"
                            v-model="dia"
                            label="Día"
                            :min="fechaMinima()"
                            :disabled="!puedeEscribir || enviando"
                        />
                        <BaseInput
                            id="encuentro-hora"
                            v-model="hora"
                            label="Hora"
                            type="time"
                            :disabled="!puedeEscribir || enviando"
                        />
                    </div>
                    <BaseInput
                        id="encuentro-lugar"
                        v-model="lugar"
                        label="Lugar"
                        type="text"
                        placeholder="Plaza, farmacia, domicilio..."
                        :disabled="!puedeEscribir || enviando"
                    />
                </form>
            </BaseCard>

            <div class="chat-entrada-3 overflow-hidden rounded-lg border border-line bg-surface">
                <div
                    ref="hilo"
                    class="flex min-h-64 max-h-[min(24rem,50dvh)] flex-col gap-3 overflow-y-auto p-3 md:max-h-[32rem] md:min-h-80"
                >
                    <p v-if="mensajes.length === 0" class="text-pretty text-sm text-muted">
                        Todavía no hay mensajes.
                    </p>
                    <TransitionGroup v-else name="chat-mensaje" tag="div" class="flex flex-col gap-3">
                        <article
                            v-for="mensaje in mensajes"
                            :key="mensaje.id"
                            class="flex max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2"
                            :class="esPropio(mensaje) ? 'self-end bg-primary-soft' : 'self-start border border-line bg-surface'"
                        >
                            <p class="text-pretty text-sm text-foreground">{{ mensaje.mensaje }}</p>
                            <p class="text-sm text-muted">{{ formatearFecha(mensaje.created_at) }}</p>
                        </article>
                    </TransitionGroup>
                </div>
                <form class="flex flex-col gap-3 border-t border-line p-3" @submit.prevent="alEnviar">
                    <BaseAlert v-if="errorEnvio !== ''" variant="error" :message="errorEnvio" />
                    <div class="flex items-end gap-2">
                    <BaseInput
                        id="chat-mensaje"
                        v-model="texto"
                        class="min-w-0 flex-1"
                        label="Mensaje"
                        type="text"
                        placeholder="Escribí un mensaje"
                        :disabled="!puedeEscribir || enviando"
                    />
                        <button
                            type="submit"
                            class="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-primary transition duration-150 ease-out hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
                            aria-label="Enviar mensaje"
                            :aria-busy="enviando ? true : undefined"
                            :disabled="!puedeEscribir || enviando || texto.trim() === ''"
                        >
                            <LoaderCircle v-if="enviando" class="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                            <Send v-else class="size-5" aria-hidden="true" />
                        </button>
                    </div>
                </form>
            </div>

            <div v-if="puedeEscribir" class="flex flex-col gap-3">
                <BaseButton
                    type="submit"
                    form="form-encuentro"
                    variant="primary"
                    size="lg"
                    class="w-full"
                    :disabled="enviando"
                >
                    Proponer encuentro
                </BaseButton>
                <BaseButton type="button" variant="danger" size="lg" class="w-full" @click="confirmarCancelacion = true">
                    Cancelar solicitud
                </BaseButton>
            </div>

            <BaseCard v-if="puedeEscribir && esDonante" variant="surface" padding="md" bordered class="rounded-lg shadow-sm">
                <form class="flex flex-col gap-3" @submit.prevent="alConfirmar">
                    <p class="text-pretty text-foreground">
                        Cuando se encuentren, pedile el código de 6 dígitos al receptor y cargalo acá.
                    </p>
                    <BaseAlert v-if="errorConfirmar !== ''" variant="error" :message="errorConfirmar" />
                    <BaseInput
                        id="codigo-retiro"
                        v-model="codigo"
                        label="Código de retiro"
                        type="text"
                        placeholder="123456"
                        inputmode="numeric"
                        maxlength="6"
                        autocomplete="one-time-code"
                        :disabled="confirmando"
                    />
                    <BaseButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        class="w-full"
                        :loading="confirmando"
                        :disabled="!codigoValido"
                    >
                        Confirmar entrega
                    </BaseButton>
                </form>
            </BaseCard>

            <BaseModal
                v-model:open="confirmarCancelacion"
                variant="danger"
                size="sm"
                title="Cancelar solicitud"
                description="El medicamento vuelve a estar disponible para otra persona."
                :locked="cancelando"
                :close-on-backdrop="!cancelando"
                :close-on-esc="!cancelando"
            >
                <BaseAlert v-if="errorCancelar !== ''" variant="error" :message="errorCancelar" />
                <template #footer>
                    <BaseButton variant="outline" :disabled="cancelando" @click="confirmarCancelacion = false">
                        No, volver
                    </BaseButton>
                    <BaseButton variant="danger" :loading="cancelando" @click="alCancelar">
                        Sí, cancelar
                    </BaseButton>
                </template>
            </BaseModal>
        </template>
    </main>
</template>

<style scoped>
.chat-entrada {
    animation: chat-entrar 420ms ease-out both;
}

.chat-entrada-2 {
    animation: chat-entrar 420ms ease-out both;
    animation-delay: 70ms;
}

.chat-entrada-3 {
    animation: chat-entrar 420ms ease-out both;
    animation-delay: 140ms;
}

@keyframes chat-entrar {
    from {
        opacity: 0;
        transform: translateY(0.5rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.chat-mensaje-enter-active,
.chat-mensaje-leave-active {
    transition: opacity 180ms ease-out;
}

.chat-mensaje-move {
    transition: transform 180ms ease-out;
}

.chat-mensaje-enter-from,
.chat-mensaje-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .chat-entrada,
    .chat-entrada-2,
    .chat-entrada-3 {
        animation: none;
    }

    .chat-mensaje-enter-active,
    .chat-mensaje-leave-active,
    .chat-mensaje-move {
        transition: none;
    }
}
</style>
