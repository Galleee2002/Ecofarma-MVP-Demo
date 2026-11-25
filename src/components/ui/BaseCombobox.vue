<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { coincidePorInicio } from '../../lib/filtroTexto';
import { mensajeDeValidez } from '../../lib/mensajesValidacion.js';
import BaseFieldError from './BaseFieldError.vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    modelValue: {
        type: [String, Number],
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
        default: '',
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
    options: {
        type: Array,
        default: function () {
            return [];
        },
    },
    filtrarOpciones: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['update:modelValue']);

const raiz = ref(null);
const abierto = ref(false);
const indiceActivo = ref(-1);
const errorInterno = ref('');
const idAutomatico = useId();

const idInput = computed(function () {
    if (props.id !== '') {
        return props.id;
    }
    return idAutomatico;
});

const idLista = computed(function () {
    return idInput.value + '-lista';
});

const idError = computed(function () {
    return idInput.value + '-error';
});

const idHint = computed(function () {
    return idInput.value + '-hint';
});

const mensajeError = computed(function () {
    if (props.error !== '') {
        return props.error;
    }
    return errorInterno.value;
});

const tieneError = computed(function () {
    return mensajeError.value !== '';
});

const coincidencias = computed(function () {
    const texto = String(props.modelValue).trim().toLowerCase();
    const filtradas = [];

    for (const opcion of props.options) {
        if (typeof opcion !== 'string') {
            continue;
        }
        if (!props.filtrarOpciones || coincidePorInicio(opcion, texto)) {
            filtradas.push(opcion);
        }
    }

    filtradas.sort(function (a, b) {
        return a.localeCompare(b, 'es');
    });

    return filtradas;
});

const listaVisible = computed(function () {
    return abierto.value && coincidencias.value.length > 0;
});

const opcionActivaId = computed(function () {
    if (!listaVisible.value || indiceActivo.value < 0) {
        return undefined;
    }
    return idLista.value + '-' + indiceActivo.value;
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

const clasesBase = [
    'w-full min-w-0 border bg-surface font-sans text-foreground shadow-sm',
    'rounded-md placeholder:text-muted',
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
        ? 'border-danger hover:border-danger focus:border-danger focus-visible:ring-danger'
        : 'border-line hover:border-primary focus:border-primary focus-visible:ring-primary';
    return [clasesBase, tamano, estado].join(' ');
});

function clasesOpcion(indice) {
    const base = 'w-full cursor-pointer px-3 py-2 text-left font-sans text-sm text-foreground';
    if (indice === indiceActivo.value) {
        return base + ' bg-primary-soft';
    }
    return base + ' hover:bg-muted/10';
}

function cerrar() {
    abierto.value = false;
    indiceActivo.value = -1;
}

function actualizarValor(evento) {
    evento.target.setCustomValidity('');
    errorInterno.value = '';
    emit('update:modelValue', evento.target.value);
    abierto.value = true;
    indiceActivo.value = -1;
}

function alInvalid(evento) {
    evento.preventDefault();
    const campo = evento.target;
    if (!campo.validity.customError) {
        campo.setCustomValidity(mensajeDeValidez(campo));
    }
    errorInterno.value = campo.validationMessage || mensajeDeValidez(campo);
}

function alEnfocar() {
    if (props.disabled) {
        return;
    }
    if (coincidencias.value.length > 0) {
        abierto.value = true;
    }
}

function elegir(opcion) {
    errorInterno.value = '';
    emit('update:modelValue', opcion);
    cerrar();
}

function moverActivo(direccion) {
    if (coincidencias.value.length === 0) {
        return;
    }

    abierto.value = true;
    const total = coincidencias.value.length;
    if (indiceActivo.value < 0) {
        indiceActivo.value = direccion > 0 ? 0 : total - 1;
        return;
    }

    indiceActivo.value = (indiceActivo.value + direccion + total) % total;
}

function alTecla(evento) {
    if (props.disabled) {
        return;
    }

    if (evento.key === 'ArrowDown') {
        evento.preventDefault();
        moverActivo(1);
        return;
    }

    if (evento.key === 'ArrowUp') {
        evento.preventDefault();
        moverActivo(-1);
        return;
    }

    if (evento.key === 'Enter' && listaVisible.value && indiceActivo.value >= 0) {
        evento.preventDefault();
        elegir(coincidencias.value[indiceActivo.value]);
        return;
    }

    if (evento.key === 'Escape') {
        cerrar();
    }
}

function alClicDocumento(evento) {
    if (!abierto.value || raiz.value === null) {
        return;
    }
    if (!raiz.value.contains(evento.target)) {
        cerrar();
    }
}

watch(coincidencias, function (lista) {
    if (indiceActivo.value >= lista.length) {
        indiceActivo.value = -1;
    }
});

onMounted(function () {
    document.addEventListener('mousedown', alClicDocumento);
});

onBeforeUnmount(function () {
    document.removeEventListener('mousedown', alClicDocumento);
});
</script>

<template>
    <div ref="raiz" class="flex w-full flex-col gap-1" :class="{ 'opacity-50': disabled }">
        <label v-if="label !== ''" class="font-sans text-sm text-foreground" :for="idInput">
            {{ label }}
        </label>
        <div class="relative">
            <input
                v-bind="$attrs"
                :id="idInput"
                type="text"
                role="combobox"
                autocomplete="off"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :class="clases"
                :aria-invalid="tieneError ? true : undefined"
                :aria-describedby="descripcion"
                :aria-expanded="listaVisible ? 'true' : 'false'"
                :aria-controls="idLista"
                aria-autocomplete="list"
                :aria-activedescendant="opcionActivaId"
                @input="actualizarValor"
                @invalid="alInvalid"
                @focus="alEnfocar"
                @keydown="alTecla"
            />
            <ul
                v-show="listaVisible"
                :id="idLista"
                role="listbox"
                class="absolute left-0 right-0 z-50 mt-1 max-h-[min(15rem,50dvh)] w-full overflow-y-auto overscroll-contain rounded-md border border-line bg-surface shadow-md"
            >
                <li
                    v-for="(opcion, indice) in coincidencias"
                    :id="idLista + '-' + indice"
                    :key="opcion"
                    role="option"
                    :aria-selected="indice === indiceActivo"
                    :class="clasesOpcion(indice)"
                    @mousedown.prevent="elegir(opcion)"
                    @mouseenter="indiceActivo = indice"
                >
                    {{ opcion }}
                </li>
            </ul>
        </div>
        <BaseFieldError v-if="tieneError" :id="idError" :message="mensajeError" />
        <p v-if="hint !== ''" :id="idHint" class="text-xs text-muted">
            {{ hint }}
        </p>
    </div>
</template>
