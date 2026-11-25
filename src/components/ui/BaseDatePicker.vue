<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { Calendar, ChevronLeft, ChevronRight } from '@lucide/vue';
import BaseFieldError from './BaseFieldError.vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Elegí una fecha',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
    },
    min: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const raiz = ref(null);
const abierto = ref(false);
const idAutomatico = useId();
const hoyVista = new Date();
const vista = ref({
    anio: hoyVista.getFullYear(),
    mes: hoyVista.getMonth(),
});

const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const idInput = computed(function () {
    if (props.id !== '') {
        return props.id;
    }
    return idAutomatico;
});

const idCalendario = computed(function () {
    return idInput.value + '-calendario';
});

const idError = computed(function () {
    return idInput.value + '-error';
});

const idHint = computed(function () {
    return idInput.value + '-hint';
});

const mensajeError = computed(function () {
    return props.error;
});

const tieneError = computed(function () {
    return mensajeError.value !== '';
});

const descripcion = computed(function () {
    const ids = [];
    if (tieneError.value) {
        ids.push(idError.value);
    }
    if (props.hint !== '') {
        ids.push(idHint.value);
    }
    if (ids.length === 0) {
        return undefined;
    }
    return ids.join(' ');
});

const textoVisible = computed(function () {
    const fecha = parsearFecha(props.modelValue);
    if (fecha === null) {
        return '';
    }
    return fecha.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
});

const tituloMes = computed(function () {
    const fecha = new Date(vista.value.anio, vista.value.mes, 1);
    const texto = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
});

const puedeIrAtras = computed(function () {
    const minima = parsearFecha(props.min);
    if (minima === null) {
        return true;
    }
    if (vista.value.anio > minima.getFullYear()) {
        return true;
    }
    return vista.value.anio === minima.getFullYear() && vista.value.mes > minima.getMonth();
});

const celdas = computed(function () {
    const anio = vista.value.anio;
    const mes = vista.value.mes;
    const primero = new Date(anio, mes, 1);
    const huecos = diaSemanaLunes(primero);
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const resultado = [];

    for (let i = 0; i < huecos; i++) {
        resultado.push({
            clave: 'vacio-' + i,
            vacio: true,
        });
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const iso = formatearIso(new Date(anio, mes, dia));
        resultado.push({
            clave: iso,
            vacio: false,
            dia: dia,
            iso: iso,
            deshabilitado: estaAntesDeMin(iso),
            seleccionado: iso === props.modelValue,
        });
    }

    return resultado;
});

const clasesBase = [
    'flex w-full min-w-0 items-center justify-between gap-2 border bg-surface text-left font-sans shadow-sm',
    'rounded-md',
    'transition duration-150 ease-out motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:bg-muted/10',
].join(' ');

const tamanos = {
    sm: 'min-h-8 px-3 text-sm',
    md: 'min-h-10 px-3 text-base',
    lg: 'min-h-12 px-4 text-lg',
};

const clases = computed(function () {
    const tamano = tamanos[props.size] ?? tamanos.md;
    const estado = tieneError.value
        ? 'border-danger hover:border-danger focus-visible:ring-danger'
        : 'border-line hover:border-primary focus-visible:ring-primary';
    const texto = textoVisible.value === '' ? 'text-muted' : 'text-foreground';
    return [clasesBase, tamano, estado, texto].join(' ');
});

function parsearFecha(texto) {
    if (typeof texto !== 'string' || texto === '') {
        return null;
    }

    const partes = texto.split('-');
    if (partes.length !== 3) {
        return null;
    }

    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);
    if (!Number.isInteger(anio) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
        return null;
    }

    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
        return null;
    }

    return fecha;
}

function formatearIso(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

function diaSemanaLunes(fecha) {
    const dia = fecha.getDay();
    if (dia === 0) {
        return 6;
    }
    return dia - 1;
}

function estaAntesDeMin(iso) {
    if (props.min === '') {
        return false;
    }
    return iso < props.min;
}

function sincronizarVista() {
    const fecha = parsearFecha(props.modelValue) || parsearFecha(props.min) || new Date();
    vista.value = {
        anio: fecha.getFullYear(),
        mes: fecha.getMonth(),
    };
}

function cerrar() {
    abierto.value = false;
}

function abrir() {
    if (props.disabled) {
        return;
    }
    sincronizarVista();
    abierto.value = true;
}

function alternar() {
    if (abierto.value) {
        cerrar();
        return;
    }
    abrir();
}

function mesAnterior() {
    if (!puedeIrAtras.value) {
        return;
    }
    if (vista.value.mes === 0) {
        vista.value = {
            anio: vista.value.anio - 1,
            mes: 11,
        };
        return;
    }
    vista.value = {
        anio: vista.value.anio,
        mes: vista.value.mes - 1,
    };
}

function mesSiguiente() {
    if (vista.value.mes === 11) {
        vista.value = {
            anio: vista.value.anio + 1,
            mes: 0,
        };
        return;
    }
    vista.value = {
        anio: vista.value.anio,
        mes: vista.value.mes + 1,
    };
}

function elegir(iso) {
    if (estaAntesDeMin(iso)) {
        return;
    }
    emit('update:modelValue', iso);
    cerrar();
}

function clasesDia(celda) {
    const base = 'inline-flex size-9 items-center justify-center rounded-sm font-sans text-sm';
    if (celda.deshabilitado) {
        return base + ' cursor-not-allowed text-muted/50';
    }
    if (celda.seleccionado) {
        return base + ' bg-primary text-surface';
    }
    return base + ' cursor-pointer text-foreground hover:bg-primary-soft';
}

function alClicDocumento(evento) {
    if (!abierto.value || raiz.value === null) {
        return;
    }
    if (!raiz.value.contains(evento.target)) {
        cerrar();
    }
}

function alTeclaDocumento(evento) {
    if (!abierto.value) {
        return;
    }
    if (evento.key === 'Escape') {
        cerrar();
    }
}

onMounted(function () {
    document.addEventListener('mousedown', alClicDocumento);
    document.addEventListener('keydown', alTeclaDocumento);
});

onBeforeUnmount(function () {
    document.removeEventListener('mousedown', alClicDocumento);
    document.removeEventListener('keydown', alTeclaDocumento);
});
</script>

<template>
    <div ref="raiz" class="flex w-full flex-col gap-1" :class="{ 'opacity-50': disabled }">
        <label v-if="label !== ''" class="font-sans text-sm text-foreground" :for="idInput">
            {{ label }}
        </label>
        <div class="relative">
            <button
                v-bind="$attrs"
                :id="idInput"
                type="button"
                :disabled="disabled"
                :class="clases"
                :aria-invalid="tieneError ? true : undefined"
                :aria-describedby="descripcion"
                :aria-expanded="abierto ? 'true' : 'false'"
                :aria-controls="idCalendario"
                :aria-required="required ? 'true' : undefined"
                aria-haspopup="dialog"
                @click="alternar"
            >
                <span class="min-w-0 truncate">{{ textoVisible === '' ? placeholder : textoVisible }}</span>
                <Calendar class="shrink-0 text-icon" :size="16" aria-hidden="true" />
            </button>
            <div
                v-show="abierto"
                :id="idCalendario"
                role="dialog"
                aria-label="Calendario"
                class="absolute z-20 mt-1 w-full rounded-md border border-line bg-surface p-3 shadow-md"
            >
                <div class="mb-3 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        class="inline-flex size-8 items-center justify-center rounded-sm text-icon hover:bg-muted/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="!puedeIrAtras"
                        aria-label="Mes anterior"
                        @click="mesAnterior"
                    >
                        <ChevronLeft :size="18" aria-hidden="true" />
                    </button>
                    <p class="font-heading text-sm font-bold text-foreground">{{ tituloMes }}</p>
                    <button
                        type="button"
                        class="inline-flex size-8 items-center justify-center rounded-sm text-icon hover:bg-muted/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        aria-label="Mes siguiente"
                        @click="mesSiguiente"
                    >
                        <ChevronRight :size="18" aria-hidden="true" />
                    </button>
                </div>
                <div class="grid grid-cols-7 gap-1">
                    <span
                        v-for="(dia, indice) in diasSemana"
                        :key="indice + '-' + dia"
                        class="inline-flex size-9 items-center justify-center font-sans text-xs font-semibold text-muted"
                    >
                        {{ dia }}
                    </span>
                    <template v-for="celda in celdas" :key="celda.clave">
                        <span v-if="celda.vacio" class="size-9" />
                        <button
                            v-else
                            type="button"
                            :class="clasesDia(celda)"
                            :disabled="celda.deshabilitado"
                            :aria-pressed="celda.seleccionado ? 'true' : 'false'"
                            :aria-label="celda.iso"
                            @click="elegir(celda.iso)"
                        >
                            {{ celda.dia }}
                        </button>
                    </template>
                </div>
            </div>
        </div>
        <BaseFieldError v-if="tieneError" :id="idError" :message="mensajeError" />
        <p v-if="hint !== ''" :id="idHint" class="text-xs text-muted">
            {{ hint }}
        </p>
    </div>
</template>
