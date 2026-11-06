/* Worker de Cloudflare Pages · duomarketingdigital.com
 *
 * En modo avanzado este archivo atiende TODAS las peticiones:
 *   POST /api/cotizacion  → valida, guarda en D1, responde `registrado`, y después
 *                           avisa (webhook) y manda el evento a Meta (Conversions API)
 *   /servicios(.html)     → 301 a /#servicios (la página vieja de precios ya no existe)
 *   *.mp4                 → respuestas por rangos (206), que Safari en iOS exige
 *   páginas HTML          → configuración pública inyectada en <script id="cfg">
 *   resto                 → archivos estáticos, con caché según lleven ?v= o no
 *
 *   www.duomarketingdigital.com → 301 al dominio sin www, misma ruta y consulta
 *   *.pages.dev           → X-Robots-Tag: noindex (el dominio real sí se indexa)
 *
 * Variables (wrangler.jsonc o panel de Pages):
 *   PIXEL_ID · WHATSAPP_NUMBER
 *   META_API_VERSION · META_TEST_EVENT_CODE (solo para probar)
 * Secretos (`wrangler pages secret put … --project-name duo-web`):
 *   META_CAPI_TOKEN · AVISO_WEBHOOK_URL (opcional)
 * Base: binding DB → D1 «duo-web», tabla `cotizaciones` (migrations/).
 */

import {
  validarEnvio, segmentar, SEGMENTOS, OPCIONES, limpiarNecesita, limpiarNombre, limpiarTexto,
  normalizarTelefono, telefonoInternacional, leerCampana,
} from './js/cotizacion.js';

const MAX_CUERPO = 8 * 1024;

export const DOMINIO = 'duomarketingdigital.com';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ruta = url.pathname;

    // www → dominio sin www, con la misma ruta y consulta (una sola versión indexada).
    if (url.hostname === `www.${DOMINIO}`) {
      return new Response(null, { status: 301, headers: { Location: `https://${DOMINIO}${ruta}${url.search}` } });
    }
    // Las direcciones *.pages.dev (vista previa y despliegues) no se indexan nunca;
    // el dominio real sí.
    const opciones = { noindex: url.hostname.endsWith('.pages.dev') };

    if (ruta === '/api/cotizacion') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405, { Allow: 'POST' });
      return conCabeceras(await recibirCotizacion(request, env, ctx), opciones);
    }
    if (ruta.startsWith('/api/')) return conCabeceras(json({ ok: false, error: 'No encontrado' }, 404), opciones);

    if (/^\/servicios(\.html|\/)?$/.test(ruta)) {
      return conCabeceras(new Response(null, { status: 301, headers: { Location: '/#servicios' } }), opciones);
    }

    if (ruta.endsWith('.mp4')) return conCabeceras(await servirVideo(request, env), opciones);

    const respuesta = await env.ASSETS.fetch(request);
    const tipo = respuesta.headers.get('content-type') || '';
    if (tipo.includes('text/html')) return conCabeceras(inyectarConfig(respuesta, env), { ...opciones, cache: 'html' });
    return conCabeceras(respuesta, { ...opciones, cache: url.searchParams.has('v') ? 'inmutable' : 'estatico' });
  },
};

/* ─── Cabeceras comunes ──────────────────────────────────────────────────── */

export function conCabeceras(respuesta, { noindex = false, cache = null } = {}) {
  const r = new Response(respuesta.body, respuesta);
  r.headers.set('X-Content-Type-Options', 'nosniff');
  r.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  r.headers.set('X-Frame-Options', 'SAMEORIGIN');
  r.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (noindex) r.headers.set('X-Robots-Tag', 'noindex, nofollow');
  if (respuesta.ok) {
    // Un archivo con ?v= es esa versión para siempre: el build cambia la huella
    // cuando cambia el contenido. Sin ?v= se revalida, para que nadie se quede
    // viendo una foto vieja (ver memoria «cache-de-imagenes-sin-version»).
    if (cache === 'html') r.headers.set('Cache-Control', 'no-cache');
    else if (cache === 'inmutable') r.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    else if (cache === 'estatico') r.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  return r;
}

/* ─── Configuración pública en la página ─────────────────────────────────── */

export function configPublica(env = {}) {
  return {
    pixelId: String(env.PIXEL_ID || '').replace(/\D/g, ''),
    // Vacío = la página usa el número que el build tomó de datos/datos.mjs.
    whatsapp: String(env.WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  };
}

function inyectarConfig(respuesta, env) {
  // «<» escapado: nadie puede cerrar la etiqueta desde una variable.
  const cfg = JSON.stringify(configPublica(env)).replace(/</g, '\\u003c');
  return new HTMLRewriter()
    .on('script#cfg', { element(el) { el.setInnerContent(cfg, { html: true }); } })
    .transform(respuesta);
}

/* ─── Video por rangos ───────────────────────────────────────────────────── */

/** Interpreta la cabecera Range. Devuelve null (sin rango), 'invalido' o { inicio, fin }. */
export function leerRango(cabecera, tamano) {
  if (!cabecera) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(cabecera).trim());
  if (!m || (m[1] === '' && m[2] === '')) return 'invalido';
  let inicio;
  let fin;
  if (m[1] === '') {
    const sufijo = Number(m[2]);
    if (sufijo === 0) return 'invalido';
    inicio = Math.max(0, tamano - sufijo);
    fin = tamano - 1;
  } else {
    inicio = Number(m[1]);
    fin = m[2] === '' ? tamano - 1 : Math.min(Number(m[2]), tamano - 1);
  }
  if (inicio >= tamano || fin < inicio) return 'invalido';
  return { inicio, fin };
}

async function servirVideo(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Método no permitido', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const original = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
  if (!original.ok || !(original.headers.get('content-type') || '').includes('video')) return original;
  const datos = await original.arrayBuffer();
  const tamano = datos.byteLength;
  const versionado = new URL(request.url).searchParams.has('v');
  const cabeceras = new Headers({
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': versionado ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
  });
  const etag = original.headers.get('etag');
  if (etag) cabeceras.set('ETag', etag);

  const rango = leerRango(request.headers.get('range'), tamano);
  if (rango === 'invalido') {
    cabeceras.set('Content-Range', `bytes */${tamano}`);
    return new Response(null, { status: 416, headers: cabeceras });
  }
  const sinCuerpo = request.method === 'HEAD';
  if (!rango) {
    cabeceras.set('Content-Length', String(tamano));
    return new Response(sinCuerpo ? null : datos, { status: 200, headers: cabeceras });
  }
  const trozo = datos.slice(rango.inicio, rango.fin + 1);
  cabeceras.set('Content-Range', `bytes ${rango.inicio}-${rango.fin}/${tamano}`);
  cabeceras.set('Content-Length', String(trozo.byteLength));
  return new Response(sinCuerpo ? null : trozo, { status: 206, headers: cabeceras });
}

/* ─── POST /api/cotizacion ───────────────────────────────────────────────── */

async function recibirCotizacion(request, env, ctx) {
  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return json({ ok: false, error: 'Se esperaba JSON' }, 415);
  }
  const texto = await request.text();
  if (texto.length > MAX_CUERPO) return json({ ok: false, error: 'Demasiado grande' }, 413);

  let datos;
  try { datos = JSON.parse(texto); } catch { return json({ ok: false, error: 'JSON no válido' }, 400); }
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return json({ ok: false, error: 'JSON no válido' }, 400);

  // Trampa para robots: el campo está oculto, una persona no lo llena.
  // `registrado: false` impide que el navegador lo cuente como contacto, y el
  // log con el user agent es la única forma de enterarse si un día atrapa a
  // alguien de verdad. No se guarda nada de lo que escribió.
  if (datos.ref_interna) {
    console.warn('[trampa] envío descartado ·', request.headers.get('user-agent') || 'sin user agent');
    return json({ ok: true, registrado: false });
  }

  const { ok, errores } = validarEnvio(datos);
  if (!ok) return json({ ok: false, errores }, 400);

  const segmento = segmentar(datos);
  const { evento } = SEGMENTOS[segmento];
  const eventId = /^[\w-]{8,64}$/.test(String(datos.eventId || '')) ? String(datos.eventId) : crypto.randomUUID();
  const ahora = new Date();
  const fila = construirFila(datos, { segmento, evento, eventId, ahora, userAgent: request.headers.get('user-agent') || '' });

  // Se guarda ANTES de responder: `registrado` tiene que decir la verdad.
  const id = await guardarCotizacion(env, fila);
  console.log(`[cotizacion] ${id !== null ? `guardada id=${id}` : 'NO SE GUARDÓ'} · ${segmento} · ${evento}`);

  // Aviso y Meta corren después de responder: la persona no los espera.
  const tarea = procesarEnSegundoPlano(env, request, fila, id).catch((e) => console.error('[cotizacion] fallo:', e?.message || e));
  if (ctx?.waitUntil) ctx.waitUntil(tarea);

  return json({ ok: true, registrado: id !== null, segmento, eventId });
}

/**
 * - El aviso sale siempre, incluso sin fila: si la base falló es cuando más
 *   falta hace enterarse de que alguien pidió una cotización.
 * - Meta solo se entera si hay fila. Un contacto que no quedó registrado no es
 *   un contacto: contárselo le enseña a traer gente que no vamos a atender.
 */
export async function procesarEnSegundoPlano(env, request, fila, id) {
  const aviso = comoAcabo('aviso', () => enviarAviso(env, fila, id));
  const capi = id === null
    ? 'sin_registro'
    : await comoAcabo('capi', () => {
      const motivo = motivoSinCapi(env);
      return motivo ? Promise.resolve(motivo) : enviarCapi(env, request, fila);
    });
  const webhook = await aviso;
  if (id !== null) await actualizarEstados(env, id, { capi, webhook });
  return { capi, webhook };
}

async function comoAcabo(nombre, envio) {
  try {
    return await envio();
  } catch (e) {
    console.error(`[${nombre}] fallo:`, e?.message || e);
    return `error:${e?.estado || (e?.name === 'TimeoutError' ? 'tiempo' : 'red')}`;
  }
}

/* ─── D1 ─────────────────────────────────────────────────────────────────── */

export const COLUMNAS = [
  'creado', 'event_id', 'nombre', 'telefono', 'pais', 'necesita', 'rubro', 'ciudad', 'inversion', 'plazo',
  'segmento', 'evento', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid',
  'pagina', 'user_agent', 'capi_estado', 'webhook_estado',
];
const SQL_INSERTAR = `INSERT INTO cotizaciones (${COLUMNAS.join(', ')}) VALUES (${COLUMNAS.map(() => '?').join(', ')})`;
const SQL_ESTADOS = 'UPDATE cotizaciones SET capi_estado = ?, webhook_estado = ? WHERE id = ?';

/** Origen + ruta, sin parámetros ni fragmento (pueden llevar datos personales). */
export function paginaSinParametros(url) {
  try {
    const u = new URL(String(url || ''));
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    return (u.origin + u.pathname).slice(0, 300);
  } catch {
    return '';
  }
}

export function construirFila(datos, { segmento, evento, eventId, ahora = new Date(), userAgent = '' }) {
  const campana = leerCampana(datos.campana && typeof datos.campana === 'object' ? datos.campana : datos);
  return {
    creado: ahora.toISOString(),
    event_id: eventId,
    nombre: limpiarNombre(datos.nombre),
    telefono: telefonoInternacional(datos.telefono, datos.pais),
    pais: datos.pais,
    necesita: limpiarNecesita(datos.necesita).join(','),
    rubro: limpiarTexto(datos.rubro),
    ciudad: limpiarTexto(datos.ciudad, 60),
    inversion: datos.inversion,
    plazo: datos.plazo,
    segmento,
    evento,
    utm_source: campana.utm_source || '',
    utm_medium: campana.utm_medium || '',
    utm_campaign: campana.utm_campaign || '',
    utm_content: campana.utm_content || '',
    utm_term: campana.utm_term || '',
    fbclid: campana.fbclid || '',
    pagina: paginaSinParametros(datos.url),
    user_agent: String(userAgent).slice(0, 300),
    capi_estado: 'pendiente',
    webhook_estado: 'pendiente',
  };
}

/** Inserta la fila. Devuelve el id, o null si no hay base o falla (nunca lanza). */
export async function guardarCotizacion(env, fila) {
  if (!env.DB) {
    console.warn('[d1] sin binding DB: la cotización no se guarda');
    return null;
  }
  try {
    const r = await env.DB.prepare(SQL_INSERTAR).bind(...COLUMNAS.map((c) => fila[c] ?? null)).run();
    return r?.meta?.last_row_id ?? null;
  } catch (e) {
    console.error('[d1] no se pudo guardar:', e?.message || e);
    return null;
  }
}

async function actualizarEstados(env, id, { capi, webhook }) {
  try {
    await env.DB.prepare(SQL_ESTADOS).bind(capi, webhook, id).run();
  } catch (e) {
    console.error('[d1] no se pudieron guardar los estados:', e?.message || e);
  }
}

/* ─── Aviso (webhook opcional) ───────────────────────────────────────────── */

function errorHttp(mensaje, estado) {
  return Object.assign(new Error(mensaje), { estado });
}

/** Apps Script responde 302 cuando su doPost ya corrió: ese 302 es el acuse. */
export function avisoEntregado(estado) {
  return (estado >= 200 && estado < 300) || estado === 301 || estado === 302 || estado === 303;
}

async function enviarAviso(env, fila, id) {
  if (!env.AVISO_WEBHOOK_URL) return 'sin_url';
  const cuerpo = {
    ...fila,
    id,
    necesita_texto: fila.necesita.split(',').filter(Boolean).map((k) => OPCIONES.necesita[k]).join(', '),
    inversion_texto: OPCIONES.inversion[fila.inversion] || '',
    plazo_texto: OPCIONES.plazo[fila.plazo] || '',
    pais_texto: OPCIONES.pais[fila.pais]?.nombre || '',
    guardada: id !== null,
  };
  const r = await fetch(env.AVISO_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
    redirect: 'manual', // no se sigue el 302 de Apps Script, y no se reintenta: duplicaría la fila
    signal: AbortSignal.timeout(25_000),
  });
  if (!avisoEntregado(r.status)) throw errorHttp(`aviso respondió ${r.status}`, r.status);
  return 'ok';
}

/* ─── Conversions API ────────────────────────────────────────────────────── */

export function motivoSinCapi(env = {}) {
  if (!String(env.PIXEL_ID || '').replace(/\D/g, '')) return 'sin_pixel';
  if (!env.META_CAPI_TOKEN) return 'sin_token';
  return null;
}

export async function sha256(texto) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Nombre de pila en minúsculas, sin acentos ni signos (norma de Meta para `fn`). */
export function nombreParaMeta(nombre) {
  return limpiarNombre(nombre).split(' ')[0]
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-zñ]/g, '').replace(/ñ/g, 'n');
}

export function leerCookies(cabecera = '') {
  const salida = {};
  for (const trozo of cabecera.split(';')) {
    const i = trozo.indexOf('=');
    if (i > 0) salida[trozo.slice(0, i).trim()] = trozo.slice(i + 1).trim();
  }
  return salida;
}

export async function construirEventoCapi(request, fila) {
  const cookies = leerCookies(request.headers.get('cookie') || '');
  const segundos = Math.floor(new Date(fila.creado).getTime() / 1000);
  let fbc = cookies._fbc;
  if (!fbc && fila.fbclid) fbc = `fb.1.${segundos * 1000}.${fila.fbclid}`;

  const user_data = {
    ph: [await sha256(fila.telefono)], // internacional, sin «+»
    client_ip_address: request.headers.get('cf-connecting-ip') || undefined,
    client_user_agent: request.headers.get('user-agent') || undefined,
  };
  if (fila.pais) user_data.country = [await sha256(fila.pais)];
  const fn = nombreParaMeta(fila.nombre);
  if (fn) user_data.fn = [await sha256(fn)];
  if (cookies._fbp) user_data.fbp = cookies._fbp;
  if (fbc) user_data.fbc = fbc;

  return {
    event_name: fila.evento,
    event_time: segundos,
    event_id: fila.event_id,
    action_source: 'website',
    event_source_url: fila.pagina || new URL(request.url).origin + '/',
    user_data,
    custom_data: { content_name: 'Cotización', content_category: fila.segmento },
  };
}

async function enviarCapi(env, request, fila) {
  const pixel = String(env.PIXEL_ID || '').replace(/\D/g, '');
  const version = env.META_API_VERSION || 'v23.0';
  const cuerpo = {
    data: [await construirEventoCapi(request, fila)],
    access_token: env.META_CAPI_TOKEN, // en el cuerpo, nunca en la URL
  };
  if (env.META_TEST_EVENT_CODE) cuerpo.test_event_code = env.META_TEST_EVENT_CODE;
  const r = await fetch(`https://graph.facebook.com/${version}/${pixel}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw errorHttp(`Meta respondió ${r.status}: ${(await r.text()).slice(0, 300)}`, r.status);
  return 'ok';
}

function json(cuerpo, estado = 200, extra = {}) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });
}
