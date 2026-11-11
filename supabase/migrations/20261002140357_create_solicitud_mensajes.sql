create table public.solicitud_mensajes (
  id bigint generated always as identity primary key,
  solicitud_id uuid not null references public.solicitudes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  mensaje text not null check (length(trim(mensaje)) > 0),
  created_at timestamptz not null default now()
);

create index solicitud_mensajes_solicitud_id_created_at_idx
  on public.solicitud_mensajes (solicitud_id, created_at);
create index solicitud_mensajes_user_id_idx on public.solicitud_mensajes (user_id);

alter table public.solicitud_mensajes enable row level security;
