<script setup>
import { computed, ref, useId } from 'vue';
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
    rows: {
        type: Number,
        default: 4,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    readonly: {
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
    maxlength: {
        type: Number,
        default: null,
    },
    showCounter: {
        type: Boolean,
        default: false,
    },
    resize: {
        type: String,
        default: 'vertical',
    },
});

const emit = defineEmits(['update:modelValue']);

const idAutomatico = useId();

const idTextarea = computed(function () {
    if (props.id !== '') {
        return props.id;
    }
    return idAutomatico;
});

const idError = computed(function () {
    return idTextarea.value + '-error';
});

const idHint = computed(function () {
    return idTextarea.value + '-hint';
});

const errorInterno = ref('');

const mensajeError = computed(function () {
    if (props.error !== '') {
        return props.error;
    }
    return errorInterno.value;
});

const tieneError = computed(function () {
    return mensajeError.value !== '';
});

const tieneLimite = computed(function () {
    return Number.isFinite(props.maxlength) && props.maxlength >= 0;
});

const mostrarContador = computed(function () {
    return props.showCounter && tieneLimite.value;
});

const longitud = computed(function () {
    if (props.modelValue === null || props.modelValue === undefined) {
        return 0;
    }
    return String(props.modelValue).length;
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
    'w-full min-w-0 border bg-surface px-3 py-2 font-sans text-base text-foreground shadow-sm',
    'rounded-md placeholder:text-muted',
    'transition duration-150 ease-out motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:bg-muted/10',
].join(' ');

const clases = computed(function () {
    const estado = tieneError.value
        ? 'border-danger hover:border-danger focus-visible:ring-danger'
        : 'border-line hover:border-primary focus-visible:ring-primary';
    const redimension = props.resize === 'none' ? 'resize-none' : 'resize-y';
    return [clasesBase, estado, redimension].join(' ');
});

function actualizarValor(evento) {
    evento.target.setCustomValidity('');
    errorInterno.value = '';
    emit('update:modelValue', evento.target.value);
}

function alInvalid(evento) {
    evento.preventDefault();
    const campo = evento.target;
    if (!campo.validity.customError) {
        campo.setCustomValidity(mensajeDeValidez(campo));
    }
    errorInterno.value = campo.validationMessage || mensajeDeValidez(campo);
}
</script>

<template>
    <div class="flex w-full flex-col gap-1" :class="{ 'opacity-50': disabled }">
        <label v-if="label !== ''" class="font-sans text-sm text-foreground" :for="idTextarea">
            {{ label }}
        </label>
        <textarea
            v-bind="$attrs"
            :id="idTextarea"
            :value="modelValue"
            :placeholder="placeholder"
            :rows="rows"
            :disabled="disabled"
            :required="required"
            :readonly="readonly"
            :maxlength="tieneLimite ? maxlength : undefined"
            :class="clases"
            :aria-invalid="tieneError ? true : undefined"
            :aria-describedby="descripcion"
            @input="actualizarValor"
            @invalid="alInvalid"
        />
        <BaseFieldError v-if="tieneError" :id="idError" :message="mensajeError" />
        <div v-if="hint !== '' || mostrarContador" class="flex items-start justify-between gap-2">
            <p v-if="hint !== ''" :id="idHint" class="text-xs text-muted">
                {{ hint }}
            </p>
            <p v-if="mostrarContador" class="ml-auto shrink-0 text-xs text-muted tabular-nums">
                {{ longitud }}/{{ maxlength }}
            </p>
        </div>
    </div>
</template>
