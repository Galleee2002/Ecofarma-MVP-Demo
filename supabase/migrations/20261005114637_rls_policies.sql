-- Funciones auxiliares security definer: leen sin pasar por RLS y evitan la recursión entre
-- las políticas de medicamentos y solicitudes.

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

create or replace function public.es_participante(p_solicitud_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.solicitudes s
    join public.medicamentos m on m.id = s.medicamento_id
    where s.id = p_solicitud_id
      and (select auth.uid()) in (s.receptor_id, m.user_id)
  );
$$;

create or replace function public.solicito_medicamento(p_medicamento_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.solicitudes
    where medicamento_id = p_medicamento_id
      and receptor_id = (select auth.uid())
  );
$$;

-- Solo expone el nombre: DNI, teléfono y dirección del otro participante quedan ocultos.
create or replace function public.participantes_solicitud(p_solicitud_id uuid)
returns table (id uuid, name varchar)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name
  from public.solicitudes s
  join public.medicamentos m on m.id = s.medicamento_id
  join public.profiles p on p.id in (s.receptor_id, m.user_id)
  where s.id = p_solicitud_id
    and public.es_participante(p_solicitud_id);
$$;

-- Solo el receptor obtiene el código; el donante lo recibe en persona al entregar.
create or replace function public.obtener_codigo_confirmacion(p_solicitud_id uuid)
returns varchar
language sql
stable
security definer
set search_path = ''
as $$
  select codigo_confirmacion
  from public.solicitudes
  where id = p_solicitud_id
    and receptor_id = (select auth.uid());
$$;

revoke execute on function
  public.es_admin(),
  public.es_participante(uuid),
  public.solicito_medicamento(uuid),
  public.participantes_solicitud(uuid),
  public.obtener_codigo_confirmacion(uuid)
from public, anon;

grant execute on function
  public.es_admin(),
  public.es_participante(uuid),
  public.solicito_medicamento(uuid),
  public.participantes_solicitud(uuid),
  public.obtener_codigo_confirmacion(uuid)
to authenticated;

-- profiles

create policy "profiles: leer el propio o admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));

create policy "profiles: editar el propio"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- RLS filtra filas, no columnas: rol, is_validado, dni y DDJJ quedan fuera del alcance del usuario.
revoke update on public.profiles from anon, authenticated;
grant update (telefono, direccion, localidad) on public.profiles to authenticated;

-- medicamentos_habilitados

create policy "medicamentos_habilitados: lectura pública"
  on public.medicamentos_habilitados for select to anon, authenticated
  using (true);

-- medicamentos

create policy "medicamentos: catálogo público"
  on public.medicamentos for select to anon, authenticated
  using (estado = 'disponible' and fecha_vencimiento >= current_date);

create policy "medicamentos: el donante ve las suyas"
  on public.medicamentos for select to authenticated
  using (user_id = (select auth.uid()));

create policy "medicamentos: el receptor ve las que solicitó"
  on public.medicamentos for select to authenticated
  using (public.solicito_medicamento(id));

create policy "medicamentos: el admin ve todas"
  on public.medicamentos for select to authenticated
  using ((select public.es_admin()));

-- solicitudes

create policy "solicitudes: leen los participantes o admin"
  on public.solicitudes for select to authenticated
  using (public.es_participante(id) or (select public.es_admin()));

-- codigo_confirmacion no se expone: el receptor lo obtiene con obtener_codigo_confirmacion().
revoke select on public.solicitudes from anon, authenticated;
grant select (
  id, medicamento_id, receptor_id, es_para_tercero, nombre_destinatario_final,
  receta_medica_url, acepto_ddjj_receptor, fecha_aceptacion_ddjj, estado,
  fecha_entrega, created_at, updated_at
) on public.solicitudes to authenticated;

-- solicitud_mensajes

create policy "solicitud_mensajes: leen los participantes"
  on public.solicitud_mensajes for select to authenticated
  using (public.es_participante(solicitud_id));

create policy "solicitud_mensajes: escriben los participantes"
  on public.solicitud_mensajes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.es_participante(solicitud_id)
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.is_validado
    )
    and exists (
      select 1 from public.solicitudes s
      where s.id = solicitud_mensajes.solicitud_id
        and s.estado in ('pendiente_coordinacion', 'en_camino')
    )
  );
