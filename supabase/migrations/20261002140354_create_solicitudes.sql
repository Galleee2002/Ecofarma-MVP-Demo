create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  medicamento_id uuid not null references public.medicamentos (id) on delete restrict,
  receptor_id uuid not null references public.profiles (id) on delete cascade,
  es_para_tercero boolean not null default false,
  nombre_destinatario_final varchar,
  receta_medica_url varchar,
  codigo_confirmacion varchar(6) check (codigo_confirmacion ~ '^[0-9]{6}$'),
  acepto_ddjj_receptor boolean not null default false,
  fecha_aceptacion_ddjj timestamptz,
  estado varchar not null default 'pendiente_coordinacion'
    check (estado in ('pendiente_coordinacion', 'en_camino', 'completado', 'cancelado')),
  fecha_entrega timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not es_para_tercero or nombre_destinatario_final is not null)
);

create index solicitudes_medicamento_id_idx on public.solicitudes (medicamento_id);
create index solicitudes_receptor_id_idx on public.solicitudes (receptor_id);

alter table public.solicitudes enable row level security;

create trigger solicitudes_set_updated_at
  before update on public.solicitudes
  for each row execute function public.set_updated_at();
