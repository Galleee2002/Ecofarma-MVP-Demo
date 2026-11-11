<script setup>
import { computed, ref, useId } from 'vue';
import { Upload } from '@lucide/vue';
import BaseButton from './BaseButton.vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    id: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: 'JPG, PNG o WEBP, hasta 5 MB. Máximo 3 fotos.',
    },
    accept: {
        type: String,
        default: 'image/jpeg,image/png,image/webp',
    },
    multiple: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['select']);

const inputArchivo = ref(null);
const arrastrando = ref(false);
const contadorArrastre = ref(0);
const idAutomatico = useId();

const idInput = computed(function () {
    if (props.id !== '') {
        return props.id;
    }
    return idAutomatico;
});

const idHint = computed(function () {
    return idInput.value + '-hint';
});

const clasesZona = computed(function () {
    const base = [
        'flex min-h-40 w-full flex-col items-center justify-center gap-3',
        'rounded-md border border-dashed bg-surface px-4 py-8 text-center',
        'transition duration-150 ease-out motion-reduce:transition-none',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background',
    ];

    if (props.disabled) {
        base.push('cursor-not-allowed border-line opacity-50');
        return base.join(' ');
    }

    if (arrastrando.value) {
        base.push('cursor-pointer border-primary bg-primary-soft');
        return base.join(' ');
    }

    base.push('cursor-pointer border-line hover:border-primary');
    return base.join(' ');
});

function listarArchivos(lista) {
    const archivos = [];
    if (lista === null || lista === undefined) {
        return archivos;
    }
    for (const archivo of lista) {
        archivos.push(archivo);
    }
    return archivos;
}

function emitirArchivos(lista) {
    const archivos = listarArchivos(lista);
    if (archivos.length === 0) {
        return;
    }
    emit('select', archivos);
}

function abrirSelector() {
    if (props.disabled || inputArchivo.value === null) {
        return;
    }
    inputArchivo.value.click();
}

function alClicZona() {
    abrirSelector();
}

function alClicBoton(evento) {
    evento.stopPropagation();
    abrirSelector();
}

function alCambiar(evento) {
    emitirArchivos(evento.target.files);
    evento.target.value = '';
}

function alArrastrarEncima(evento) {
    evento.preventDefault();
    if (props.disabled) {
        return;
    }
    if (evento.type === 'dragenter') {
        contadorArrastre.value += 1;
    }
    arrastrando.value = true;
}

function alArrastrarSalida(evento) {
    evento.preventDefault();
    contadorArrastre.value -= 1;
    if (contadorArrastre.value <= 0) {
        contadorArrastre.value = 0;
        arrastrando.value = false;
    }
}

function alSoltar(evento) {
    evento.preventDefault();
    contadorArrastre.value = 0;
    arrastrando.value = false;
    if (props.disabled) {
        return;
    }
    emitirArchivos(evento.dataTransfer.files);
}
</script>

<template>
    <div class="flex w-full flex-col gap-1">
        <label v-if="label !== ''" class="font-sans text-sm text-foreground" :for="idInput">
            {{ label }}
        </label>
        <div
            :class="clasesZona"
            @click="alClicZona"
            @dragenter="alArrastrarEncima"
            @dragover="alArrastrarEncima"
            @dragleave="alArrastrarSalida"
            @drop="alSoltar"
        >
            <input
                v-bind="$attrs"
                :id="idInput"
                ref="inputArchivo"
                type="file"
                class="sr-only"
                :accept="accept"
                :multiple="multiple"
                :disabled="disabled"
                :aria-describedby="hint !== '' ? idHint : undefined"
                @click.stop
                @change="alCambiar"
            />
            <span class="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface" aria-hidden="true">
                <Upload class="text-icon" :size="18" />
            </span>
            <span class="font-sans text-base text-foreground">Subí o arrastrá tu imagen aquí</span>
            <span v-if="hint !== ''" :id="idHint" class="font-sans text-xs text-muted">
                {{ hint }}
            </span>
            <BaseButton type="button" variant="primary" size="sm" :disabled="disabled" @click="alClicBoton">
                Buscar imagen
            </BaseButton>
        </div>
    </div>
</template>
