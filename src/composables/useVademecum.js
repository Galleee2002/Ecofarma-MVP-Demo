import { ref } from 'vue';
import { supabase } from '../lib/supabase';

export function useVademecum() {
    const filas = ref([]);
    const cargando = ref(false);
    const error = ref('');

    async function cargarSugerencias() {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await supabase
            .from('medicamentos_habilitados')
            .select('id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, presentacion, requiere_receta')
            .order('principio_activo', { ascending: true });

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar el vademécum. Podés completar los datos igual.';
            filas.value = [];
        } else {
            filas.value = data;
        }

        cargando.value = false;
    }

    return {
        filas,
        cargando,
        error,
        cargarSugerencias,
    };
}
