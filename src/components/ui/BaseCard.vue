<script setup>
import { computed } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    variant: {
        type: String,
        default: 'plain',
    },
    aspect: {
        type: String,
        default: '16/9',
    },
    padding: {
        type: String,
        default: 'md',
    },
    bordered: {
        type: Boolean,
        default: false,
    },
});

const aspectos = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '1/1': 'aspect-square',
    '21/9': 'aspect-[21/9]',
};

const rellenos = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const variante = computed(function () {
    if (props.variant === 'editorial' || props.variant === 'surface') {
        return props.variant;
    }
    return 'plain';
});

const claseAspecto = computed(function () {
    return aspectos[props.aspect] ?? aspectos['16/9'];
});

const clases = computed(function () {
    if (variante.value === 'editorial') {
        return 'group/card flex w-full min-w-0 flex-col bg-transparent';
    }

    if (variante.value === 'surface') {
        const relleno = rellenos[props.padding] ?? rellenos.md;
        const borde = props.bordered ? 'border border-line' : '';
        return ['flex w-full min-w-0 flex-col gap-4 bg-surface', relleno, borde].filter(Boolean).join(' ');
    }

    return 'w-full min-w-0 bg-transparent';
});

const clasesMedia = computed(function () {
    if (variante.value !== 'editorial') {
        return 'min-w-0 [&_img]:h-auto [&_img]:max-w-full';
    }

    return [
        'relative overflow-hidden rounded-lg',
        claseAspecto.value,
        '[&>*]:absolute [&>*]:inset-0 [&>*]:size-full',
        '[&_img]:size-full [&_img]:object-cover',
        '[&_img]:motion-safe:transition-transform [&_img]:motion-safe:duration-300 [&_img]:motion-safe:ease-out',
        'motion-safe:group-hover/card:[&_img]:scale-[1.02]',
    ].join(' ');
});

const clasesTexto = computed(function () {
    if (variante.value === 'editorial') {
        return 'flex flex-col gap-3';
    }
    return 'flex min-w-0 flex-col gap-4';
});

const clasesEyebrow = computed(function () {
    if (variante.value !== 'editorial') {
        return 'min-w-0';
    }
    return 'font-sans text-xs font-semibold tracking-[0.14em] text-primary uppercase';
});

const clasesHeader = computed(function () {
    if (variante.value !== 'editorial') {
        return 'min-w-0';
    }
    return 'font-heading text-xl font-bold text-balance text-foreground';
});

const clasesContenido = computed(function () {
    if (variante.value !== 'editorial') {
        return 'min-w-0';
    }
    return 'font-sans text-base text-pretty text-muted';
});

const clasesFooter = computed(function () {
    if (variante.value !== 'editorial') {
        return 'min-w-0';
    }

    return [
        'min-w-0 pt-2',
        '[&_a]:inline-flex [&_a]:w-fit [&_a]:items-center [&_a]:gap-2',
        '[&_a]:font-sans [&_a]:text-xs [&_a]:font-semibold [&_a]:tracking-[0.14em] [&_a]:uppercase',
        '[&_a]:text-primary [&_a]:no-underline',
        '[&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-primary [&_a]:focus-visible:ring-offset-2',
        '[&_a]:focus-visible:ring-offset-background [&_a]:focus-visible:outline-none',
        '[&_a_svg]:motion-safe:transition-transform [&_a_svg]:motion-safe:duration-300 [&_a_svg]:motion-safe:ease-out',
        '[&_a_span:last-child]:motion-safe:transition-transform [&_a_span:last-child]:motion-safe:duration-300',
        '[&_a_span:last-child]:motion-safe:ease-out',
        'motion-safe:group-hover/card:[&_a_svg]:translate-x-1',
        'motion-safe:group-hover/card:[&_a_span:last-child]:translate-x-1',
        'motion-safe:[&_a:focus-visible_svg]:translate-x-1',
        'motion-safe:[&_a:focus-visible_span:last-child]:translate-x-1',
    ].join(' ');
});
</script>

<template>
    <div v-bind="$attrs" :class="clases">
        <template v-if="variante === 'plain'">
            <slot name="media" />
            <slot name="eyebrow" />
            <slot name="header" />
            <slot />
            <slot name="footer" />
        </template>
        <template v-else>
            <div v-if="$slots.media" :class="clasesMedia">
                <slot name="media" />
            </div>
            <div
                v-if="$slots.eyebrow || $slots.header || $slots.default || $slots.footer"
                :class="[clasesTexto, variante === 'editorial' && $slots.media ? 'pt-5' : '']"
            >
                <div v-if="$slots.eyebrow" :class="clasesEyebrow">
                    <slot name="eyebrow" />
                </div>
                <div v-if="$slots.header" :class="clasesHeader">
                    <slot name="header" />
                </div>
                <div v-if="$slots.default" :class="clasesContenido">
                    <slot />
                </div>
                <div v-if="$slots.footer" :class="clasesFooter">
                    <slot name="footer" />
                </div>
            </div>
        </template>
    </div>
</template>
