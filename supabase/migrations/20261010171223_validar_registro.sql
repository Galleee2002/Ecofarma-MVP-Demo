create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  acepto boolean := coalesce((new.raw_user_meta_data ->> 'acepto_ddjj')::boolean, false);
  nombre varchar := trim(new.raw_user_meta_data ->> 'name');
  dni varchar := trim(new.raw_user_meta_data ->> 'dni');
  telefono varchar := trim(new.raw_user_meta_data ->> 'telefono');
  direccion varchar := trim(new.raw_user_meta_data ->> 'direccion');
  localidad varchar := trim(new.raw_user_meta_data ->> 'localidad');
begin
  if acepto = false then
    raise exception 'Registro rechazado: no se aceptaron los Términos y la DDJJ';
  end if;

  if coalesce(nombre, '') = ''
    or coalesce(dni, '') = ''
    or coalesce(telefono, '') = ''
    or coalesce(direccion, '') = ''
    or coalesce(localidad, '') = '' then
    raise exception 'Registro rechazado: faltan datos obligatorios';
  end if;

  insert into public.profiles (id, name, dni, telefono, direccion, localidad, acepto_ddjj, fecha_aceptacion_ddjj)
  values (new.id, nombre, dni, telefono, direccion, localidad, true, now());

  return new;
end;
$$;
