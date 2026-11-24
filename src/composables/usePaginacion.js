import { computed, ref, watch } from 'vue';

export const POR_PAGINA = 15;

export function usePaginacion(lista, alCambiarFiltro, porPagina = POR_PAGINA) {
    const pagina = ref(1);

    watch(alCambiarFiltro, function () {
        pagina.value = 1;
    });

    watch(lista, function () {
        const ultima = Math.ceil(lista.value.length / porPagina);
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
        const inicio = (pagina.value - 1) * porPagina;
        return lista.value.slice(inicio, inicio + porPagina);
    });

    return {
        pagina,
        total,
        visibles,
    };
}
