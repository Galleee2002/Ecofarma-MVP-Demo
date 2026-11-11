import { computed, ref, watch } from 'vue';

export const POR_PAGINA = 15;

export function usePaginacion(lista, alCambiarFiltro) {
    const pagina = ref(1);

    watch(alCambiarFiltro, function () {
        pagina.value = 1;
    });

    watch(lista, function () {
        const ultima = Math.ceil(lista.value.length / POR_PAGINA);
        if (ultima < 1) {
            pagina.value = 1;
            return;
        }
        if (pagina.value > ultima) {
            pagina.value = ultima;
        }
    });

    const total = computed(function () {
        return lista.value.length;
    });

    const visibles = computed(function () {
        const inicio = (pagina.value - 1) * POR_PAGINA;
        return lista.value.slice(inicio, inicio + POR_PAGINA);
    });

    return {
        pagina,
        total,
        visibles,
    };
}
