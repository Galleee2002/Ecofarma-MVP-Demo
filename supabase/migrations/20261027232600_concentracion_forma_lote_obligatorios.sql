update public.medicamentos
set
  concentracion = coalesce(nullif(btrim(concentracion), ''), 'sin dato'),
  forma_farmaceutica = coalesce(nullif(btrim(forma_farmaceutica), ''), 'sin dato'),
  lote = coalesce(nullif(btrim(lote), ''), 'sin lote')
where concentracion is null
   or forma_farmaceutica is null
   or lote is null
   or btrim(concentracion) = ''
   or btrim(forma_farmaceutica) = ''
   or btrim(lote) = '';

alter table public.medicamentos
  alter column concentracion set not null,
  alter column forma_farmaceutica set not null,
  alter column lote set not null;
