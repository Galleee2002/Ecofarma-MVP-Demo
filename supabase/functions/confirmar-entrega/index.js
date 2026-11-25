import { createClient } from 'npm:@supabase/supabase-js@2';

const MENSAJE_ERROR_GENERAL = 'No pudimos confirmar la entrega. Intentá de nuevo en unos minutos.';
const ESTADOS_ACTIVOS = ['pendiente_coordinacion', 'en_camino'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function responder(cuerpo, estado) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: {
      'Access-Control-Allow-Origin': corsHeaders['Access-Control-Allow-Origin'],
      'Access-Control-Allow-Headers': corsHeaders['Access-Control-Allow-Headers'],
      'Access-Control-Allow-Methods': corsHeaders['Access-Control-Allow-Methods'],
      'Content-Type': 'application/json',
    },
  });
}

function limpiarTexto(valor) {
  if (typeof valor !== 'string') {
    return '';
  }
  return valor.trim();
}

Deno.serve(async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return responder({ error: 'Acción no permitida.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.replace('Bearer ', '');
  if (token === '') {
    return responder({ error: 'Tenés que iniciar sesión para confirmar la entrega.' }, 401);
  }

  const { data: datosUsuario, error: errorUsuario } = await supabase.auth.getUser(token);
  if (errorUsuario || !datosUsuario.user) {
    console.error(errorUsuario);
    return responder({ error: 'Tenés que iniciar sesión para confirmar la entrega.' }, 401);
  }
  const usuario = datosUsuario.user;

  const { data: perfil, error: errorPerfil } = await supabase
    .from('profiles')
    .select('is_validado')
    .eq('id', usuario.id)
    .single();

  if (errorPerfil) {
    console.error(errorPerfil);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (!perfil.is_validado) {
    return responder({ error: 'Tu cuenta está suspendida, no podés confirmar la entrega.' }, 403);
  }

  let datos;
  try {
    datos = await req.json();
  } catch (errorJson) {
    console.error(errorJson);
    return responder({ error: 'Los datos enviados no son válidos.' }, 400);
  }

  const solicitudId = limpiarTexto(datos.solicitud_id);
  const codigo = limpiarTexto(datos.codigo);
  if (solicitudId === '') {
    return responder({ error: 'No se indicó la solicitud.' }, 400);
  }

  if (!/^[0-9]{6}$/.test(codigo)) {
    return responder({ error: 'El código tiene que tener 6 dígitos.' }, 400);
  }

  const { data: solicitud, error: errorSolicitud } = await supabase
    .from('solicitudes')
    .select('id, estado, codigo_confirmacion, medicamento_id, medicamentos(id, user_id, estado)')
    .eq('id', solicitudId)
    .maybeSingle();

  if (errorSolicitud) {
    console.error(errorSolicitud);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (solicitud === null) {
    return responder({ error: 'No encontramos esta solicitud.' }, 404);
  }

  const medicamento = solicitud.medicamentos;
  if (medicamento === null) {
    console.error('La solicitud no tiene medicamento.');
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (medicamento.user_id !== usuario.id) {
    return responder({ error: 'Solo el donante puede confirmar la entrega.' }, 403);
  }

  if (!ESTADOS_ACTIVOS.includes(solicitud.estado) || medicamento.estado !== 'reservado') {
    return responder({ error: 'Esta solicitud ya no se puede confirmar.' }, 409);
  }

  if (solicitud.codigo_confirmacion !== codigo) {
    return responder({ error: 'El código no coincide. Pedile al receptor que te lo dicte de nuevo.' }, 400);
  }

  const estadoAnterior = solicitud.estado;
  const fechaEntrega = new Date().toISOString();

  const { data: cerrada, error: errorCierre } = await supabase
    .from('solicitudes')
    .update({ estado: 'completado', fecha_entrega: fechaEntrega })
    .eq('id', solicitudId)
    .eq('estado', estadoAnterior)
    .eq('codigo_confirmacion', codigo)
    .select('id')
    .maybeSingle();

  if (errorCierre) {
    console.error(errorCierre);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (cerrada === null) {
    return responder({ error: 'Esta solicitud ya no se puede confirmar.' }, 409);
  }

  const { data: entregado, error: errorEntrega } = await supabase
    .from('medicamentos')
    .update({ estado: 'entregado' })
    .eq('id', medicamento.id)
    .eq('estado', 'reservado')
    .select('id')
    .maybeSingle();

  if (errorEntrega || entregado === null) {
    if (errorEntrega) {
      console.error(errorEntrega);
    }
    const { error: errorRevertir } = await supabase
      .from('solicitudes')
      .update({ estado: estadoAnterior, fecha_entrega: null })
      .eq('id', solicitudId)
      .eq('estado', 'completado');
    if (errorRevertir) {
      console.error(errorRevertir);
    }
    if (errorEntrega) {
      return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
    }
    return responder({ error: 'Esta solicitud ya no se puede confirmar.' }, 409);
  }

  return responder({ ok: true }, 200);
});
