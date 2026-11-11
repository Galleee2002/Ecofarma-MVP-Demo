create table public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  medicamento_habilitado_id bigint references public.medicamentos_habilitados (id) on delete set null,
  nombre_comercial varchar not null,
  principio_activo varchar not null,
  concentracion varchar,
  forma_farmaceutica varchar,
  cantidad_disponible integer not null check (cantidad_disponible >= 0),
  lote varchar,
  fecha_vencimiento date not null,
  fotos_envase jsonb not null default '[]'::jsonb
    check (jsonb_typeof(fotos_envase) = 'array' and jsonb_array_length(fotos_envase) <= 3),
  descripcion text,
  estado varchar not null default 'disponible'
    check (estado in ('disponible', 'pendiente_revision', 'reservado', 'entregado', 'rechazado')),
  motivo_rechazo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medicamentos_busqueda_idx
  on public.medicamentos (nombre_comercial, principio_activo, estado);
create index medicamentos_user_id_idx on public.medicamentos (user_id);
create index medicamentos_medicamento_habilitado_id_idx on public.medicamentos (medicamento_habilitado_id);

alter table public.medicamentos enable row level security;

create trigger medicamentos_set_updated_at
  before update on public.medicamentos
  for each row execute function public.set_updated_at();
