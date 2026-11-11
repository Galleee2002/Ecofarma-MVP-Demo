import { obtenerFechaDeHoy } from './fechas';
import { supabase } from './supabase';

export async function listarMedicamentosDisponibles() {
    return supabase
        .from('medicamentos')
        .select('id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, cantidad_disponible, fecha_vencimiento, fotos_envase, created_at, medicamentos_habilitados(requiere_receta)')
        .eq('estado', 'disponible')
        .gte('fecha_vencimiento', obtenerFechaDeHoy());
}

export async function obtenerMedicamentoDisponiblePorId(id) {
    return supabase
        .from('medicamentos')
        .select('id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, cantidad_disponible, fecha_vencimiento, fotos_envase, lote, descripcion, medicamento_habilitado_id, medicamentos_habilitados(requiere_receta)')
        .eq('id', id)
        .eq('estado', 'disponible')
        .gte('fecha_vencimiento', obtenerFechaDeHoy())
        .maybeSingle();
}
