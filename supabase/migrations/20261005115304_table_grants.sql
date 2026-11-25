-- Este proyecto no otorga permisos por defecto a los roles de la API: cada tabla nueva necesita
-- GRANT explícito, además de sus políticas RLS.

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;

grant select on public.medicamentos_habilitados to anon, authenticated;
grant select on public.medicamentos to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.solicitud_mensajes to authenticated;
