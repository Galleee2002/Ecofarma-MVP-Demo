import { onBeforeUnmount, ref } from 'vue';
import { listarLocalidadesPorProvincia, listarProvincias, validarLocalidad } from '../lib/georef';

export function useGeoref() {
    const opcionesProvincia = ref([]);
    const opcionesLocalidad = ref([]);
    const cargandoProvincias = ref(false);
    const cargandoLocalidades = ref(false);
    const errorGeoref = ref('');

    let pedidoLocalidad = 0;

    async function cargarProvincias() {
        cargandoProvincias.value = true;
        errorGeoref.value = '';
        const opciones = await listarProvincias();
        opcionesProvincia.value = opciones;
        cargandoProvincias.value = false;

        if (opciones.length === 0) {
            errorGeoref.value = 'No pudimos cargar las provincias. Intentá de nuevo en unos minutos.';
        }
    }

    function limpiarLocalidades() {
        pedidoLocalidad += 1;
        opcionesLocalidad.value = [];
        cargandoLocalidades.value = false;
    }

    async function cargarLocalidadesProvincia(provincia) {
        errorGeoref.value = '';
        const nombreProvincia = String(provincia || '').trim();

        if (nombreProvincia === '') {
            limpiarLocalidades();
            return;
        }

        const idPedido = pedidoLocalidad + 1;
        pedidoLocalidad = idPedido;
        cargandoLocalidades.value = true;
        opcionesLocalidad.value = [];

        const resultados = await listarLocalidadesPorProvincia(nombreProvincia);
        if (idPedido !== pedidoLocalidad) {
            return;
        }

        opcionesLocalidad.value = resultados;
        cargandoLocalidades.value = false;

        if (resultados.length === 0) {
            errorGeoref.value = 'No pudimos cargar las localidades de esa provincia. Intentá de nuevo en unos minutos.';
        }
    }

    async function localidadEsValida(provincia, localidad) {
        const nombre = String(localidad || '').trim().toLowerCase();
        if (nombre === '') {
            return false;
        }

        for (const opcion of opcionesLocalidad.value) {
            if (opcion.toLowerCase() === nombre) {
                return true;
            }
        }

        return validarLocalidad(provincia, localidad);
    }

    function provinciaEsValida(provincia) {
        const nombre = String(provincia || '').trim();
        if (nombre === '') {
            return false;
        }
        for (const opcion of opcionesProvincia.value) {
            if (opcion.value === nombre) {
                return true;
            }
        }
        return false;
    }

    onBeforeUnmount(function () {
        pedidoLocalidad += 1;
    });

    return {
        opcionesProvincia,
        opcionesLocalidad,
        cargandoProvincias,
        cargandoLocalidades,
        errorGeoref,
        cargarProvincias,
        limpiarLocalidades,
        cargarLocalidadesProvincia,
        localidadEsValida,
        provinciaEsValida,
    };
}
