import { createClient } from 'npm:@supabase/supabase-js@2';

const MAXIMO_FOTOS = 3;
const MENSAJE_ERROR_GENERAL = 'No pudimos publicar la donación. Intentá de nuevo en unos minutos.';

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

function textoONull(valor) {
  if (valor === '') {
    return null;
  }
  return valor;
}

function validarDatos(datos, prefijoFotos) {
  if (
    limpiarTexto(datos.nombre_comercial) === '' ||
    limpiarTexto(datos.principio_activo) === '' ||
    limpiarTexto(datos.concentracion) === '' ||
    limpiarTexto(datos.forma_farmaceutica) === '' ||
    limpiarTexto(datos.lote) === '' ||
    limpiarTexto(datos.fecha_vencimiento) === ''
  ) {
    return 'Completá el nombre comercial, el principio activo, la concentración, la forma farmacéutica, el lote, la cantidad y la fecha de vencimiento.';
  }

  const cantidad = datos.cantidad_disponible;
  if (typeof cantidad !== 'number' || !Number.isInteger(cantidad) || cantidad < 1) {
    return 'La cantidad tiene que ser un número entero mayor o igual a 1.';
  }

  if (limpiarTexto(datos.fecha_vencimiento) <= obtenerFechaDeHoy()) {
    return 'No se pueden donar medicamentos vencidos o que vencen hoy. Revisá la fecha de vencimiento.';
  }

  const fotos = datos.fotos_envase;
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return 'Subí al menos una foto del envase.';
  }

  if (fotos.length > MAXIMO_FOTOS) {
    return 'Podés subir hasta 3 fotos del envase.';
  }

  const nombres = datos.nombres_fotos;
  if (!Array.isArray(nombres) || nombres.length !== fotos.length) {
    return 'Las fotos del envase no son válidas. Volvé a subirlas.';
  }

  const nombresVistos = [];
  for (let i = 0; i < fotos.length; i++) {
    const foto = fotos[i];
    const nombre = nombres[i];
    if (typeof foto !== 'string' || !foto.startsWith(prefijoFotos)) {
      return 'Las fotos del envase no son válidas. Volvé a subirlas.';
    }
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return 'Las fotos del envase no son válidas. Volvé a subirlas.';
    }
    const nombreNormalizado = nombre.toLowerCase();
    if (nombresVistos.includes(nombreNormalizado)) {
      return 'No podés subir dos fotos con el mismo nombre.';
    }
    nombresVistos.push(nombreNormalizado);
  }

  return '';
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
    return responder({ error: 'Tenés que iniciar sesión para publicar una donación.' }, 401);
  }

  const { data: datosUsuario, error: errorUsuario } = await supabase.auth.getUser(token);
  if (errorUsuario || !datosUsuario.user) {
    console.error(errorUsuario);
    return responder({ error: 'Tenés que iniciar sesión para publicar una donación.' }, 401);
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
    return responder({ error: 'Tu cuenta está suspendida, no podés publicar donaciones.' }, 403);
  }

  let datos;
  try {
    datos = await req.json();
  } catch (errorJson) {
    console.error(errorJson);
    return responder({ error: 'Los datos enviados no son válidos.' }, 400);
  }

  const prefijoFotos = supabaseUrl + '/storage/v1/object/public/fotos-envases/' + usuario.id + '/';
  const errorValidacion = validarDatos(datos, prefijoFotos);
  if (errorValidacion !== '') {
    return responder({ error: errorValidacion }, 400);
  }

  const principioActivo = limpiarTexto(datos.principio_activo);
  const concentracion = limpiarTexto(datos.concentracion);
  const formaFarmaceutica = limpiarTexto(datos.forma_farmaceutica);

  let medicamentoHabilitadoId = null;

  const { data: coincidencias, error: errorVademecum } = await supabase
    .from('medicamentos_habilitados')
    .select('id')
    .eq('principio_activo', principioActivo)
    .eq('concentracion', concentracion)
    .eq('forma_farmaceutica', formaFarmaceutica)
    .limit(1);

  if (errorVademecum) {
    console.error(errorVademecum);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (coincidencias.length > 0) {
    medicamentoHabilitadoId = coincidencias[0].id;
  }

  let estado = 'pendiente_revision';
  if (medicamentoHabilitadoId !== null) {
    estado = 'disponible';
  }

  const { data: nuevoMedicamento, error: errorInsert } = await supabase
    .from('medicamentos')
    .insert({
      user_id: usuario.id,
      medicamento_habilitado_id: medicamentoHabilitadoId,
      nombre_comercial: limpiarTexto(datos.nombre_comercial),
      principio_activo: principioActivo,
      concentracion: concentracion,
      forma_farmaceutica: formaFarmaceutica,
      cantidad_disponible: datos.cantidad_disponible,
      lote: limpiarTexto(datos.lote),
      fecha_vencimiento: limpiarTexto(datos.fecha_vencimiento),
      fotos_envase: datos.fotos_envase,
      descripcion: textoONull(limpiarTexto(datos.descripcion)),
      estado: estado,
    })
    .select('id, estado')
    .single();

  if (errorInsert) {
    console.error(errorInsert);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  return responder({ id: nuevoMedicamento.id, estado: nuevoMedicamento.estado }, 201);
});
