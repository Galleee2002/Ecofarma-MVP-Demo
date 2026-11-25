# Ecofarma

Ecofarma es una aplicación web para donar y solicitar medicamentos. Quien dona publica un medicamento del vademécum; quien lo necesita lo busca en el catálogo, lo solicita y coordina la entrega por chat.

## Funcionalidades

- Registro e inicio de sesión.
- Inicio con búsqueda y últimos medicamentos publicados.
- Catálogo con búsqueda, filtro por receta y paginación, y ficha del medicamento.
- Solicitud de un medicamento en formulario propio (`/medicamento/:id/solicitar`): motivo, opción para terceros, receta si el vademécum lo exige, y aceptación de términos y declaración jurada. Desde el catálogo, **Solicitar** abre ese formulario; **Ver detalle** muestra la ficha.
- Publicación de una donación (datos del medicamento y fotos del envase).
- Chat de la solicitud, en tiempo real.
- Perfil del usuario: datos personales, donaciones y solicitudes.
- Términos y declaración jurada.

## Versiones futuras

El acceso al panel de administración está armado, pero estas secciones todavía no están implementadas:

- Moderación de donaciones.
- Alta de medicamentos al vademécum.
- Gestión de cuentas de usuarios.

## Tecnologías

- Node.js 22 y pnpm 10.28.2
- Vue 3, Vue Router, Vite y Tailwind CSS 4
- Supabase en la nube (Postgres, Auth, Storage, Realtime y Edge Functions)

## Cómo correr el proyecto

1. Tener Node.js 22.
2. Activar pnpm:

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

3. Instalar dependencias, en la raíz del proyecto:

```bash
pnpm install
```

4. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL del proyecto y la clave anon del panel de Supabase.

5. Arrancar la aplicación y abrir la URL que muestra Vite (suele ser `http://localhost:5173`):

```bash
pnpm dev
```
