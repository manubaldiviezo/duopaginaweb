/* El Worker se prueba importándolo con env y ctx falsos: `wrangler dev` no
 * arranca en esta computadora. Cubre D1, la CAPI y la validación; HTMLRewriter
 * y el enrutado de Pages se prueban en la vista previa. */

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { leerRango, configPublica, motivoSinCapi } from '../publico/_worker.js';

const VALIDO = { necesita: ['campanas'], rubro: 'Ropa', ciudad: 'Tarija', inversion: 'alto', plazo: 'este_mes', nombre: 'Ana', pais: 'bo', telefono: '71234567', eventId: 'prueba-12345678', url: 'https://duomarketingdigital.com/?fbclid=abc' };

function baseFalsa({ falla = false } = {}) {
  const filas = [];
  const updates = [];
  return {
    filas,
    updates,
    prepare(sql) {
      return {
        bind(...v) {
          return {
            async run() {
              if (falla) throw new Error('D1 caída');
              if (sql.startsWith('INSERT')) { filas.push(v); return { meta: { last_row_id: filas.length } }; }
              updates.push(v);
              return { meta: {} };
            },
          };
        },
      };
    },
  };
}

let llamadas;
const fetchOriginal = globalThis.fetch;
beforeEach(() => {
  llamadas = [];
  globalThis.fetch = async (url, init) => { llamadas.push({ url: String(url), cuerpo: init?.body ? JSON.parse(init.body) : null }); return new Response('{}', { status: 200 }); };
});
afterEach(() => { globalThis.fetch = fetchOriginal; });

async function enviar(cuerpo, env) {
  const tareas = [];
  const r = await worker.fetch(new Request('https://duo.test/api/cotizacion', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'user-agent': 'prueba' }, body: JSON.stringify(cuerpo),
  }), env, { waitUntil: (p) => tareas.push(p) });
  await Promise.all(tareas);
  return { estado: r.status, json: await r.json(), cabeceras: r.headers };
}

const ENV_META = () => ({ DB: baseFalsa(), PIXEL_ID: '123', META_CAPI_TOKEN: 'secreto' });

test('guarda antes de responder y manda Lead a Meta para CALIENTE', async () => {
  const env = ENV_META();
  const { estado, json } = await enviar(VALIDO, env);
  assert.equal(estado, 200);
  assert.equal(json.registrado, true);
  assert.equal(json.segmento, 'CALIENTE');
  assert.equal(env.DB.filas.length, 1);
  const meta = llamadas.find((l) => l.url.includes('graph.facebook.com'));
  assert.ok(meta, 'se llamó a la CAPI');
  assert.equal(meta.cuerpo.data[0].event_name, 'Lead');
  assert.equal(meta.cuerpo.data[0].event_id, 'prueba-12345678');
  assert.equal(meta.cuerpo.access_token, 'secreto');
  assert.ok(!meta.url.includes('secreto'), 'el token nunca va en la URL');
  assert.match(meta.cuerpo.data[0].user_data.ph[0], /^[0-9a-f]{64}$/);
  assert.deepEqual(env.DB.updates.at(-1), ['ok', 'sin_url', 1]);
});

test('TIBIO manda LeadSecundario, nunca Lead', async () => {
  const env = ENV_META();
  await enviar({ ...VALIDO, inversion: 'bajo' }, env);
  const meta = llamadas.find((l) => l.url.includes('graph.facebook.com'));
  assert.equal(meta.cuerpo.data[0].event_name, 'LeadSecundario');
});

test('si D1 falla: registrado false y Meta no se entera', async () => {
  const env = { ...ENV_META(), DB: baseFalsa({ falla: true }) };
  const { json } = await enviar(VALIDO, env);
  assert.equal(json.registrado, false);
  assert.equal(llamadas.filter((l) => l.url.includes('graph.facebook.com')).length, 0);
});

test('sin base de datos tampoco hay evento', async () => {
  const { json } = await enviar(VALIDO, { PIXEL_ID: '123', META_CAPI_TOKEN: 'x' });
  assert.equal(json.registrado, false);
  assert.equal(llamadas.length, 0);
});

test('el aviso sale aunque la base falle', async () => {
  const env = { DB: baseFalsa({ falla: true }), AVISO_WEBHOOK_URL: 'https://aviso.test/' };
  await enviar(VALIDO, env);
  const aviso = llamadas.find((l) => l.url === 'https://aviso.test/');
  assert.ok(aviso);
  assert.equal(aviso.cuerpo.guardada, false);
  assert.equal(aviso.cuerpo.necesita_texto, 'Publicidad en Facebook e Instagram');
});

test('trampa para robots: no guarda, no avisa, registrado false', async () => {
  const env = { ...ENV_META(), AVISO_WEBHOOK_URL: 'https://aviso.test/' };
  const { json } = await enviar({ ...VALIDO, ref_interna: 'x' }, env);
  assert.deepEqual(json, { ok: true, registrado: false });
  assert.equal(env.DB.filas.length, 0);
  assert.equal(llamadas.length, 0);
});

test('envío inválido: 400 con errores y nada guardado', async () => {
  const env = ENV_META();
  const { estado, json } = await enviar({ ...VALIDO, telefono: '12' }, env);
  assert.equal(estado, 400);
  assert.ok(json.errores.telefono);
  assert.equal(env.DB.filas.length, 0);
});

test('sin píxel o sin token la CAPI se omite y queda anotado', async () => {
  assert.equal(motivoSinCapi({}), 'sin_pixel');
  assert.equal(motivoSinCapi({ PIXEL_ID: '1' }), 'sin_token');
  const env = { DB: baseFalsa() };
  const { json } = await enviar(VALIDO, env);
  assert.equal(json.registrado, true);
  assert.equal(llamadas.length, 0);
  assert.deepEqual(env.DB.updates.at(-1), ['sin_pixel', 'sin_url', 1]);
});

test('la fila guarda el teléfono internacional y la página sin parámetros', async () => {
  const env = { DB: baseFalsa() };
  await enviar(VALIDO, env);
  const fila = env.DB.filas[0];
  assert.ok(fila.includes('59171234567'));
  assert.ok(fila.includes('https://duomarketingdigital.com/'));
  assert.ok(!fila.some((v) => String(v).includes('fbclid=')));
});

test('/servicios redirige 301 a la sección', async () => {
  for (const ruta of ['/servicios', '/servicios.html', '/servicios/']) {
    const r = await worker.fetch(new Request(`https://duo.test${ruta}`), {}, {});
    assert.equal(r.status, 301);
    assert.equal(r.headers.get('location'), '/#servicios');
  }
});

test('GET a la API: 405', async () => {
  const r = await worker.fetch(new Request('https://duo.test/api/cotizacion'), {}, {});
  assert.equal(r.status, 405);
});

const ASSETS_FALSO = { fetch: async () => new Response('hola', { status: 200, headers: { 'content-type': 'text/plain' } }) };

test('*.pages.dev lleva noindex; el dominio real no', async () => {
  for (const host of ['duo-web.pages.dev', '1fd6554b.duo-web.pages.dev']) {
    const r = await worker.fetch(new Request(`https://${host}/robots.txt`), { ASSETS: ASSETS_FALSO }, {});
    assert.equal(r.headers.get('x-robots-tag'), 'noindex, nofollow', host);
  }
  const real = await worker.fetch(new Request('https://duomarketingdigital.com/robots.txt'), { ASSETS: ASSETS_FALSO }, {});
  assert.equal(real.status, 200);
  assert.equal(real.headers.get('x-robots-tag'), null);
  const api = await worker.fetch(new Request('https://duomarketingdigital.com/api/nada'), {}, {});
  assert.equal(api.headers.get('x-robots-tag'), null);
});

test('www redirige 301 al dominio sin www con ruta y consulta', async () => {
  const r = await worker.fetch(new Request('https://www.duomarketingdigital.com/privacidad/?utm_source=ig&x=1'), {}, {});
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), 'https://duomarketingdigital.com/privacidad/?utm_source=ig&x=1');
  const raiz = await worker.fetch(new Request('https://www.duomarketingdigital.com/'), {}, {});
  assert.equal(raiz.headers.get('location'), 'https://duomarketingdigital.com/');
  const post = await worker.fetch(new Request('https://www.duomarketingdigital.com/api/cotizacion', { method: 'POST', body: '{}' }), {}, {});
  assert.equal(post.status, 301);
});

test('rangos de video', () => {
  assert.equal(leerRango(null, 100), null);
  assert.deepEqual(leerRango('bytes=0-', 100), { inicio: 0, fin: 99 });
  assert.deepEqual(leerRango('bytes=10-19', 100), { inicio: 10, fin: 19 });
  assert.deepEqual(leerRango('bytes=-10', 100), { inicio: 90, fin: 99 });
  assert.equal(leerRango('bytes=200-', 100), 'invalido');
});

test('configuración pública: solo dígitos, nada secreto', () => {
  assert.deepEqual(configPublica({ PIXEL_ID: ' 12a3 ', WHATSAPP_NUMBER: '+591 7', META_CAPI_TOKEN: 'no' }), { pixelId: '123', whatsapp: '5917' });
});
