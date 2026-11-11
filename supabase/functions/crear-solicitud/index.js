import { createClient } from 'npm:@supabase/supabase-js@2';

const MENSAJE_ERROR_GENERAL = 'No pudimos crear la solicitud. Intentá de nuevo en unos minutos.';

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

function obtenerFechaDeHoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function limpiarTexto(valor) {
  if (typeof valor !== 'string') {
    return '';
  }
  return valor.trim();
}

function generarCodigoConfirmacion() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
    return responder({ error: 'Tenés que iniciar sesión para solicitar un medicamento.' }, 401);
  }

  const { data: datosUsuario, error: errorUsuario } = await supabase.auth.getUser(token);
  if (errorUsuario || !datosUsuario.user) {
    console.error(errorUsuario);
    return responder({ error: 'Tenés que iniciar sesión para solicitar un medicamento.' }, 401);
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
    return responder({ error: 'Tu cuenta está suspendida, no podés solicitar medicamentos.' }, 403);
  }

  let datos;
  try {
    datos = await req.json();
  } catch (errorJson) {
    console.error(errorJson);
    return responder({ error: 'Los datos enviados no son válidos.' }, 400);
  }

  const medicamentoId = limpiarTexto(datos.medicamento_id);
  if (medicamentoId === '') {
    return responder({ error: 'No se indicó el medicamento a solicitar.' }, 400);
  }

  if (datos.acepto_ddjj_receptor !== true) {
    return responder({ error: 'Tenés que aceptar la Declaración Jurada para solicitar el medicamento.' }, 400);
  }

  const esParaTercero = datos.es_para_tercero === true;
  const nombreDestinatario = limpiarTexto(datos.nombre_destinatario_final);
  if (esParaTercero && nombreDestinatario === '') {
    return responder({ error: 'Indicá el nombre de la persona para quien pedís el medicamento.' }, 400);
  }

  const { data: medicamento, error: errorMedicamento } = await supabase
    .from('medicamentos')
    .select('id, user_id, estado, fecha_vencimiento, medicamento_habilitado_id, medicamentos_habilitados(requiere_receta)')
    .eq('id', medicamentoId)
    .maybeSingle();

  if (errorMedicamento) {
    console.error(errorMedicamento);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (medicamento === null) {
    return responder({ error: 'No encontramos ese medicamento o ya no está disponible.' }, 404);
  }

  if (medicamento.estado !== 'disponible' || medicamento.fecha_vencimiento < obtenerFechaDeHoy()) {
    return responder({ error: 'Ese medicamento ya no está disponible.' }, 400);
  }

  if (medicamento.user_id === usuario.id) {
    return responder({ error: 'No podés solicitar un medicamento que vos mismo donaste.' }, 400);
  }

  const vademecum = medicamento.medicamentos_habilitados;
  const requiereReceta =
    medicamento.medicamento_habilitado_id === null ||
    (vademecum !== null && vademecum.requiere_receta === true);

  const recetaUrl = limpiarTexto(datos.receta_medica_url);
  const prefijoReceta = supabaseUrl + '/storage/v1/object/public/recetas-medicas/' + usuario.id + '/';

  if (requiereReceta) {
    if (recetaUrl === '' || !recetaUrl.startsWith(prefijoReceta)) {
      return responder({ error: 'Este medicamento requiere la foto de una receta médica. Volvé a subirla.' }, 400);
    }
  } else if (recetaUrl !== '' && !recetaUrl.startsWith(prefijoReceta)) {
    return responder({ error: 'La foto de la receta no es válida. Volvé a subirla.' }, 400);
  }

  const { data: reservado, error: errorReserva } = await supabase
    .from('medicamentos')
    .update({ estado: 'reservado' })
    .eq('id', medicamentoId)
    .eq('estado', 'disponible')
    .select('id')
    .maybeSingle();

  if (errorReserva) {
    console.error(errorReserva);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (reservado === null) {
    return responder({ error: 'Ese medicamento ya fue solicitado por otra persona.' }, 409);
  }

  const codigoConfirmacion = generarCodigoConfirmacion();
  const fechaAceptacionDdjj = new Date().toISOString();

  const { data: nuevaSolicitud, error: errorInsert } = await supabase
    .from('solicitudes')
    .insert({
      medicamento_id: medicamentoId,
      receptor_id: usuario.id,
      es_para_tercero: esParaTercero,
      nombre_destinatario_final: esParaTercero ? nombreDestinatario : null,
      receta_medica_url: recetaUrl === '' ? null : recetaUrl,
      codigo_confirmacion: codigoConfirmacion,
      acepto_ddjj_receptor: true,
      fecha_aceptacion_ddjj: fechaAceptacionDdjj,
      estado: 'pendiente_coordinacion',
    })
    .select('id')
    .single();

  if (errorInsert) {
    console.error(errorInsert);
    const { error: errorRevertir } = await supabase
      .from('medicamentos')
      .update({ estado: 'disponible' })
      .eq('id', medicamentoId)
      .eq('estado', 'reservado');
    if (errorRevertir) {
      console.error(errorRevertir);
    }
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  return responder({ id: nuevaSolicitud.id }, 201);
});
