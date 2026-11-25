<script setup>
import { computed, ref, useId } from 'vue';
import { ChevronDown } from '@lucide/vue';
import { mensajeDeValidez } from '../../lib/mensajesValidacion.js';
import BaseFieldError from './BaseFieldError.vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    modelValue: {
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
    options: {
        type: Array,
        default: function () {
            return [];
        },
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
    name: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const idAutomatico = useId();
const errorInterno = ref('');

const valor = computed({
    get: function () {
        return props.modelValue;
    },
    set: function (valorNuevo) {
        errorInterno.value = '';
        emit('update:modelValue', valorNuevo);
    },
});

const idSelect = computed(function () {
    if (props.id !== '') {
        return props.id;
    }
    return idAutomatico;
});

const idError = computed(function () {
    return idSelect.value + '-error';
});

const idHint = computed(function () {
    return idSelect.value + '-hint';
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

function alInvalid(evento) {
    evento.preventDefault();
    const campo = evento.target;
    if (!campo.validity.customError) {
        campo.setCustomValidity(mensajeDeValidez(campo));
    }
    errorInterno.value = campo.validationMessage || mensajeDeValidez(campo);
}

function alCambiar(evento) {
    evento.target.setCustomValidity('');
    errorInterno.value = '';
}

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

const sinValor = computed(function () {
    return props.modelValue === '' && props.placeholder !== '';
});

const clasesBase = [
    'w-full min-w-0 appearance-none border bg-surface font-sans shadow-sm',
    'rounded-md',
    'transition duration-150 ease-out motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:bg-muted/10',
].join(' ');

const tamanos = {
    sm: 'min-h-8 pl-3 pr-8 text-sm',
    md: 'min-h-10 pl-3 pr-8 text-base',
    lg: 'min-h-12 pl-4 pr-10 text-lg',
};

const tamanosIcono = {
    sm: 14,
    md: 16,
    lg: 18,
};

const tamanoIcono = computed(function () {
    return tamanosIcono[props.size] ?? tamanosIcono.md;
});

const clases = computed(function () {
    const tamano = tamanos[props.size] ?? tamanos.md;
    const estado = tieneError.value
        ? 'border-danger hover:border-danger focus-visible:ring-danger'
        : 'border-line hover:border-primary focus-visible:ring-primary';
    const texto = sinValor.value ? 'text-muted' : 'text-foreground';
    return [clasesBase, tamano, estado, texto].join(' ');
});
</script>

<template>
    <div class="flex w-full flex-col gap-1" :class="{ 'opacity-50': disabled }">
        <label v-if="label !== ''" class="font-sans text-sm text-foreground" :for="idSelect">
            {{ label }}
        </label>
        <div class="relative">
            <select
                v-bind="$attrs"
                :id="idSelect"
                v-model="valor"
                :name="name !== '' ? name : undefined"
                :disabled="disabled"
                :required="required"
                :class="clases"
                :aria-invalid="tieneError ? true : undefined"
                :aria-describedby="descripcion"
                @change="alCambiar"
                @invalid="alInvalid"
            >
                <option v-if="placeholder !== ''" value="" disabled>
                    {{ placeholder }}
                </option>
                <option
                    v-for="(opcion, indice) in options"
                    :key="indice + '-' + String(opcion.value)"
                    :value="opcion.value"
                    :disabled="opcion.disabled"
                >
                    {{ opcion.label }}
                </option>
            </select>
            <ChevronDown
                class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-icon"
                :size="tamanoIcono"
                aria-hidden="true"
            />
        </div>
        <BaseFieldError v-if="tieneError" :id="idError" :message="mensajeError" />
        <p v-if="hint !== ''" :id="idHint" class="text-xs text-muted">
            {{ hint }}
        </p>
    </div>
</template>
