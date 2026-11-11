<script setup>
import { computed, ref, useId } from 'vue';
import { Eye, EyeOff } from '@lucide/vue';
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
    type: {
        type: String,
        default: 'text',
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
});

const emit = defineEmits(['update:modelValue']);

const idAutomatico = useId();
const mostrarTexto = ref(false);
const errorInterno = ref('');

const idInput = computed(function () {
    if (props.id !== '') {
        return props.id;
    }
    return idAutomatico;
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

const esPassword = computed(function () {
    return props.type === 'password';
});

const tipoVisible = computed(function () {
    if (!esPassword.value) {
        return props.type;
    }
    if (mostrarTexto.value) {
        return 'text';
    }
    return 'password';
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
    sm: 'min-h-8 text-sm',
    md: 'min-h-10 text-base',
    lg: 'min-h-12 text-lg',
};

const clases = computed(function () {
    const tamano = tamanos[props.size] ?? tamanos.md;
    const padding = esPassword.value
        ? (props.size === 'lg' ? 'pl-4 pr-10' : 'pl-3 pr-10')
        : (props.size === 'lg' ? 'px-4' : 'px-3');
    const estado = tieneError.value
        ? 'border-danger hover:border-danger focus:border-danger focus-visible:ring-danger'
        : 'border-line hover:border-primary focus:border-primary focus-visible:ring-primary';
    return [clasesBase, tamano, padding, estado].join(' ');
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
        let mensaje = mensajeDeValidez(campo);
        if (campo.validity.tooShort && esPassword.value) {
            mensaje = 'La contraseña debe tener al menos ' + campo.minLength + ' caracteres.';
        }
        campo.setCustomValidity(mensaje);
    }
    errorInterno.value = campo.validationMessage || mensajeDeValidez(campo);
}

function alternarVisibilidad() {
    mostrarTexto.value = !mostrarTexto.value;
}
</script>

<template>
    <div class="flex w-full flex-col gap-1" :class="{ 'opacity-50': disabled }">
        <label v-if="label !== ''" class="font-sans text-sm text-foreground" :for="idInput">
            {{ label }}
        </label>
        <div class="relative">
            <input
                v-bind="$attrs"
                :id="idInput"
                :type="tipoVisible"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :class="clases"
                :aria-invalid="tieneError ? true : undefined"
                :aria-describedby="descripcion"
                @input="actualizarValor"
                @invalid="alInvalid"
            />
            <button
                v-if="esPassword"
                type="button"
                class="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted transition duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed motion-reduce:transition-none"
                :aria-label="mostrarTexto ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :disabled="disabled"
                @click="alternarVisibilidad"
            >
                <Eye v-if="!mostrarTexto" :size="16" aria-hidden="true" />
                <EyeOff v-else :size="16" aria-hidden="true" />
            </button>
        </div>
        <BaseFieldError v-if="tieneError" :id="idError" :message="mensajeError" />
        <p v-if="hint !== ''" :id="idHint" class="text-xs text-muted">
            {{ hint }}
        </p>
    </div>
</template>
