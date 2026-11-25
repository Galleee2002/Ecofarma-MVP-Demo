alter table public.solicitudes
  add column motivo text;

revoke select on public.solicitudes from anon, authenticated;
grant select (
  id, medicamento_id, receptor_id, es_para_tercero, nombre_destinatario_final,
  receta_medica_url, acepto_ddjj_receptor, fecha_aceptacion_ddjj, estado,
  fecha_entrega, created_at, updated_at, motivo
) on public.solicitudes to authenticated;
