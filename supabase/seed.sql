-- Datos semilla para desarrollo. Las contraseñas son públicas: no correr este seed en producción.

-- Vademécum: listado de medicamentos esenciales del Programa Remediar (Res. 3424/2021 y botiquín 2023).
-- requiere_receta = true en antibióticos y psicofármacos.

insert into public.medicamentos_habilitados
  (principio_activo, concentracion, forma_farmaceutica, presentacion, requiere_receta)
select v.principio_activo, v.concentracion, v.forma_farmaceutica, v.presentacion, v.requiere_receta
from (values
  -- Antiinfecciosos
  ('Amoxicilina', '500 mg', 'Comprimido', 'Caja x 21 comprimidos', true),
  ('Amoxicilina', '500 mg/5 ml', 'Polvo para suspensión oral', 'Frasco x 120 ml', true),
  ('Amoxicilina + ácido clavulánico', '875 mg + 125 mg', 'Comprimido', 'Caja x 14 comprimidos', true),
  ('Amoxicilina + ácido clavulánico', '400 mg + 57 mg/5 ml', 'Polvo para suspensión oral', 'Frasco x 70 ml', true),
  ('Azitromicina', '500 mg', 'Comprimido', 'Caja x 3 comprimidos', true),
  ('Azitromicina', '200 mg/5 ml', 'Polvo para suspensión oral', 'Frasco x 30 ml', true),
  ('Cefalexina', '500 mg', 'Comprimido', 'Caja x 16 comprimidos', true),
  ('Cefalexina', '250 mg/5 ml', 'Polvo para suspensión oral', 'Frasco x 90 ml', true),
  ('Ciprofloxacina', '500 mg', 'Comprimido', 'Caja x 10 comprimidos', true),
  ('Clindamicina', '300 mg', 'Comprimido', 'Caja x 16 comprimidos', true),
  ('Metronidazol', '500 mg', 'Comprimido', 'Caja x 15 comprimidos', true),
  ('Trimetoprima + sulfametoxazol', '160 mg + 800 mg', 'Comprimido', 'Caja x 10 comprimidos', true),

  -- Dermatológicos
  ('Miconazol', '2 %', 'Crema', 'Pomo x 30 g', false),
  ('Permetrina', '5 %', 'Loción', 'Frasco x 60 ml', false),
  ('Sulfadiazina de plata', '1 %', 'Crema', 'Pomo x 30 g', false),

  -- Preparaciones hormonales sistémicas
  ('Betametasona', '0,5 mg/ml', 'Solución oral (gotas)', 'Frasco gotero x 15 ml', false),
  ('Levotiroxina', '50 mcg', 'Comprimido', 'Caja x 50 comprimidos', false),
  ('Levotiroxina', '100 mcg', 'Comprimido', 'Caja x 50 comprimidos', false),
  ('Meprednisona', '4 mg', 'Comprimido', 'Caja x 20 comprimidos', false),

  -- Antiparasitarios
  ('Mebendazol', '200 mg', 'Comprimido', 'Caja x 6 comprimidos', false),
  ('Mebendazol', '100 mg/5 ml', 'Suspensión oral', 'Frasco x 30 ml', false),

  -- Sangre y hematopoyesis
  ('Ácido acetilsalicílico', '100 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Ácido fólico', '1 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Sulfato ferroso', '25 mg/ml de hierro', 'Solución oral (gotas)', 'Frasco gotero x 30 ml', false),

  -- Sistema cardiovascular
  ('Amiodarona', '200 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Amlodipina', '5 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Atenolol', '50 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Atorvastatina', '20 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Carvedilol', '6,25 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Carvedilol', '25 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Enalapril', '10 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Espironolactona', '25 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Furosemida', '40 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Hidroclorotiazida', '25 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Losartán', '50 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Simvastatina', '20 mg', 'Comprimido', 'Caja x 30 comprimidos', false),

  -- Sistema digestivo y metabolismo
  ('Glibenclamida', '5 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Metformina', '500 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Metformina', '850 mg', 'Comprimido de liberación prolongada', 'Caja x 30 comprimidos', false),
  ('Omeprazol', '20 mg', 'Cápsula', 'Caja x 30 cápsulas', false),
  ('Sales de rehidratación oral', '27,9 g', 'Polvo para solución oral', 'Caja x 3 sobres', false),

  -- Sistema músculo esquelético
  ('Ibuprofeno', '400 mg', 'Comprimido', 'Caja x 20 comprimidos', false),
  ('Ibuprofeno', '100 mg/5 ml', 'Suspensión oral', 'Frasco x 90 ml', false),

  -- Sistema nervioso: analgésicos y antiepilépticos
  ('Paracetamol', '500 mg', 'Comprimido', 'Caja x 20 comprimidos', false),
  ('Paracetamol', '100 mg/ml', 'Solución oral (gotas)', 'Frasco gotero x 20 ml', false),
  ('Carbamazepina', '200 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Divalproato de sodio', '500 mg', 'Comprimido', 'Frasco x 30 comprimidos', false),
  ('Valproato de magnesio', '400 mg', 'Comprimido', 'Caja x 30 comprimidos', false),

  -- Sistema nervioso: psicofármacos
  ('Carbonato de litio', '300 mg', 'Comprimido', 'Caja x 50 comprimidos', true),
  ('Clonazepam', '0,5 mg', 'Comprimido', 'Caja x 30 comprimidos', true),
  ('Clonazepam', '2 mg', 'Comprimido', 'Caja x 30 comprimidos', true),
  ('Diazepam', '10 mg', 'Comprimido', 'Caja x 30 comprimidos', true),
  ('Fluoxetina', '20 mg', 'Comprimido', 'Caja x 30 comprimidos', true),
  ('Haloperidol', '5 mg', 'Comprimido', 'Caja x 30 comprimidos', true),
  ('Haloperidol', '2 mg/ml', 'Solución oral (gotas)', 'Frasco gotero x 20 ml', true),
  ('Levomepromazina', '25 mg', 'Comprimido', 'Caja x 20 comprimidos', true),
  ('Risperidona', '1 mg', 'Comprimido', 'Caja x 30 comprimidos', true),
  ('Sertralina', '50 mg', 'Comprimido', 'Caja x 30 comprimidos', true),

  -- Sistema respiratorio
  ('Budesonida', '200 mcg/dosis', 'Aerosol para inhalación', 'Envase x 200 dosis', false),
  ('Loratadina', '10 mg', 'Comprimido', 'Caja x 30 comprimidos', false),
  ('Loratadina', '1 mg/ml', 'Jarabe', 'Frasco x 60 ml', false),
  ('Salbutamol', '100 mcg/dosis', 'Aerosol para inhalación', 'Envase x 200 dosis', false),
  ('Salbutamol', '5 mg/ml', 'Solución para nebulizar', 'Frasco gotero x 10 ml', false)
) as v (principio_activo, concentracion, forma_farmaceutica, presentacion, requiere_receta)
where not exists (
  select 1 from public.medicamentos_habilitados mh
  where mh.principio_activo = v.principio_activo
    and mh.concentracion = v.concentracion
    and mh.forma_farmaceutica = v.forma_farmaceutica
);

-- Usuarios: se crean en auth.users y el trigger on_auth_user_created arma su fila en profiles.
-- Contraseña de ambos: EcoFarma2026!
-- Los tokens van en '' porque Supabase Auth no admite NULL en esas columnas al iniciar sesión.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', 'admin@ecofarma.test',
    extensions.crypt('EcoFarma2026!', extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin ecofarma", "dni": "30111222", "telefono": "3510000001",
      "provincia": "Córdoba", "direccion": "Av. Colón 100", "localidad": "Córdoba", "acepto_ddjj": true}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', 'donante@ecofarma.test',
    extensions.crypt('EcoFarma2026!', extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Lucía Fernández", "dni": "32444555", "telefono": "3510000002",
      "provincia": "Córdoba", "direccion": "Bv. San Juan 450", "localidad": "Córdoba", "acepto_ddjj": true}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(), now(), now()
from auth.users u
where u.id in ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002')
on conflict (provider_id, provider) do nothing;

update public.profiles
set rol = 'admin'
where id = 'a0000000-0000-4000-8000-000000000001';
