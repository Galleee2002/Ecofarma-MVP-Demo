create table public.medicamentos_habilitados (
  id bigint generated always as identity primary key,
  nombre_comercial varchar,
  principio_activo varchar not null,
  concentracion varchar,
  forma_farmaceutica varchar,
  presentacion varchar,
  requiere_receta boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medicamentos_habilitados_busqueda_idx
  on public.medicamentos_habilitados (principio_activo, concentracion, forma_farmaceutica);

alter table public.medicamentos_habilitados enable row level security;

create trigger medicamentos_habilitados_set_updated_at
  before update on public.medicamentos_habilitados
  for each row execute function public.set_updated_at();
