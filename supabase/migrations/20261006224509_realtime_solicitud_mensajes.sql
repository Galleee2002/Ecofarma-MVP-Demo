-- Postgres Changes evalúa la política de select de solicitud_mensajes para cada suscriptor:
-- solo el donante y el receptor de la solicitud reciben los mensajes nuevos.
alter publication supabase_realtime add table public.solicitud_mensajes;
