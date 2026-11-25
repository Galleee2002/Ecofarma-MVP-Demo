import { createClient } from 'npm:@supabase/supabase-js@2';

const MENSAJE_ERROR_GENERAL = 'No pudimos cancelar la solicitud. Intentá de nuevo en unos minutos.';
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
    return responder({ error: 'Tenés que iniciar sesión para cancelar la solicitud.' }, 401);
  }

  const { data: datosUsuario, error: errorUsuario } = await supabase.auth.getUser(token);
  if (errorUsuario || !datosUsuario.user) {
    console.error(errorUsuario);
    return responder({ error: 'Tenés que iniciar sesión para cancelar la solicitud.' }, 401);
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
    return responder({ error: 'Tu cuenta está suspendida, no podés cancelar la solicitud.' }, 403);
  }

  let datos;
  try {
    datos = await req.json();
  } catch (errorJson) {
    console.error(errorJson);
    return responder({ error: 'Los datos enviados no son válidos.' }, 400);
  }

  const solicitudId = limpiarTexto(datos.solicitud_id);
  if (solicitudId === '') {
    return responder({ error: 'No se indicó la solicitud.' }, 400);
  }

  const { data: solicitud, error: errorSolicitud } = await supabase
    .from('solicitudes')
    .select('id, estado, receptor_id, medicamento_id, medicamentos(id, user_id, estado)')
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

  const esDonante = medicamento.user_id === usuario.id;
  const esReceptor = solicitud.receptor_id === usuario.id;
  if (!esDonante && !esReceptor) {
    return responder({ error: 'No podés cancelar esta solicitud.' }, 403);
  }

  if (!ESTADOS_ACTIVOS.includes(solicitud.estado) || medicamento.estado !== 'reservado') {
    return responder({ error: 'Esta solicitud ya no se puede cancelar.' }, 409);
  }

  const estadoAnterior = solicitud.estado;

  const { data: cancelada, error: errorCancelar } = await supabase
    .from('solicitudes')
    .update({ estado: 'cancelado' })
    .eq('id', solicitudId)
    .eq('estado', estadoAnterior)
    .select('id')
    .maybeSingle();

  if (errorCancelar) {
    console.error(errorCancelar);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (cancelada === null) {
    return responder({ error: 'Esta solicitud ya no se puede cancelar.' }, 409);
  }

  const { data: liberado, error: errorLiberar } = await supabase
    .from('medicamentos')
    .update({ estado: 'disponible' })
    .eq('id', medicamento.id)
    .eq('estado', 'reservado')
    .select('id')
    .maybeSingle();

  if (errorLiberar || liberado === null) {
    if (errorLiberar) {
      console.error(errorLiberar);
    }
    const { error: errorRevertir } = await supabase
      .from('solicitudes')
      .update({ estado: estadoAnterior })
      .eq('id', solicitudId)
      .eq('estado', 'cancelado');
    if (errorRevertir) {
      console.error(errorRevertir);
    }
    if (errorLiberar) {
      return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
    }
    return responder({ error: 'Esta solicitud ya no se puede cancelar.' }, 409);
  }

  return responder({ ok: true }, 200);
});
