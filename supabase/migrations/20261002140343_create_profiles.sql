create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name varchar,
  dni varchar unique,
  telefono varchar,
  direccion varchar,
  localidad varchar,
  rol varchar not null default 'user' check (rol in ('user', 'admin')),
  is_validado boolean not null default true,
  acepto_ddjj boolean not null default false,
  fecha_aceptacion_ddjj timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- rol e is_validado nunca se leen de raw_user_meta_data: el usuario controla esos metadatos al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  acepto boolean := coalesce((new.raw_user_meta_data ->> 'acepto_ddjj')::boolean, false);
begin
  insert into public.profiles (id, name, dni, telefono, direccion, localidad, acepto_ddjj, fecha_aceptacion_ddjj)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'dni',
    new.raw_user_meta_data ->> 'telefono',
    new.raw_user_meta_data ->> 'direccion',
    new.raw_user_meta_data ->> 'localidad',
    acepto,
    case when acepto then now() end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
