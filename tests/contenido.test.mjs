/* Lo que el sitio publicado no puede decir ni romper. Corre sobre el HTML
 * que escribe el build, que es lo que se despliega. */

import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { construir } from '../scripts/build.mjs';

const PUBLICO = join(dirname(fileURLToPath(import.meta.url)), '..', 'publico');
let html;
let visible;

before(async () => {
  await construir();
  html = await readFile(join(PUBLICO, 'index.html'), 'utf8');
  // Texto visible fuera del formulario (sus opciones nombran rangos de inversión
  // en publicidad, que no son precios de DÚO).
  visible = html
    .replace(/<form[\s\S]*?<\/form>/, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ');
});

test('sin precios de DÚO', () => {
  // «tu precio» es el del producto del cliente, no el de DÚO.
  assert.doesNotMatch(visible, /Bs\.?\s?\d|\d\s?Bs|\/mes|(?<!tu )precio|honorario|tarifa|US\$\s?\d+\s?(al|por) mes/i);
});

test('DÚO no dice que graba el contenido de los clientes', () => {
  assert.doesNotMatch(visible, /grabamos|vamos a tu local|equipo propio|producimos el contenido/i);
});

test('sin cifras viejas ni superlativos que no se pueden probar', () => {
  // «9,7x» sí puede aparecer como el retorno de agosto 2026 en el gráfico;
  // lo que no vuelve es la cifra vieja de toda la cuenta.
  assert.doesNotMatch(visible, /9[.,]7x\s+(de retorno|en 13)|10[.,]55|US\$\s?50\s?K|US\$\s?50 mil|el mes doce|14 marcas|5 países|menos de 24 horas|único en Bolivia|la única agencia|sin pagar un peso/i);
  assert.doesNotMatch(html, /9[.,]7x\s+(de retorno|en 13)|10[.,]55x|\+US\$50K|el mes doce/i, 'tampoco en metadatos');
  assert.doesNotMatch(visible, /Ñañitos[^<]{0,40}US\$|Climere[^<]{0,40}30/);
});

test('una sola formulación de países', () => {
  assert.match(visible, /Bolivia, Chile, Ecuador y España/);
  assert.doesNotMatch(visible, /Bolivia, Chile y Ecuador(?! y)/);
});

test('las cifras de pauta van con su período', () => {
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)[0].replace(/<[^>]+>/g, ' ');
  // El tablero del hero, en este orden.
  assert.match(hero, /\+US\$1 millón\s+en ventas web con \+US\$100 mil invertidos · 13 meses[\s\S]*10,4x\s+de retorno en las campañas a la web[\s\S]*\+34\.000\s+conversaciones por WhatsApp en 12 meses/);
  assert.doesNotMatch(hero, /vistas orgánicas/);
  assert.match(visible, /oct 2025 – oct 2026 · solo campañas a la web/);
  assert.match(visible, /\+18\.900\s+compras en la web/);
});

test('el texto de Instagram coincide con el enlace', () => {
  assert.match(html, /instagram\.com\/duo_agenciamkt[^>]*>Instagram · @duo_agenciamkt</);
});

test('ninguna marca de VERIFICAR se cuela en el HTML', () => {
  assert.doesNotMatch(html, /VERIFICAR/);
});

test('toda referencia a un archivo propio lleva ?v= y el archivo existe', async () => {
  const refs = [...html.matchAll(/["'(\s](\/(?:images|logos|reels|video|css|js)\/[\w./-]+)(\?v=[0-9a-f]{8})?/g)];
  assert.ok(refs.length > 20);
  for (const [, ruta, v] of refs) {
    assert.ok(v, `${ruta} sin ?v=`);
    await access(join(PUBLICO, ruta));
  }
});

test('portada: el teléfono pasa el video del método, no TikTok de clientes', () => {
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)[0];
  assert.match(hero, /data-src="\/video\/duo-metodo-completo-540\.mp4\?v=[0-9a-f]{8}"/);
  assert.match(hero, /<span class="tel-red">Método DÚO3X<\/span>/);
  assert.doesNotMatch(hero, /\/reels\/|tel-red">TikTok/);
  assert.doesNotMatch(html, /Un minuto para conocernos|id="video"|href="#video"/);
});

test('video del hero: mudo, en bucle, sin descarga hasta que arranca, con botón de sonido', () => {
  const video = html.match(/<video[^>]*id="video-hero"[^>]*>/)[0];
  for (const attr of ['muted', 'loop', 'playsinline', 'preload="none"']) assert.ok(video.includes(attr), attr);
  assert.doesNotMatch(video, /\ssrc=/);
  assert.match(html, /<button[^>]*id="boton-sonido"[^>]*aria-pressed="false"[\s\S]*?Activar sonido<\/span><\/button>/);
  assert.match(html, /<a href="#inicio" class="serv-ejemplo" data-sonido>Ver un ejemplo<\/a>/);
});

test('sin visor ni videos que ya no se usan', async () => {
  assert.doesNotMatch(html, /<dialog|data-abrir-visor|Ver el video completo|duo-metodo-loop\.mp4|duo-video-la-barra/);
  await assert.rejects(access(join(PUBLICO, 'video', 'duo-metodo-loop.mp4')));
  await assert.rejects(access(join(PUBLICO, 'video', 'duo-video-la-barra.mp4')));
});

test('textos nuevos de la portada', () => {
  for (const t of [
    'Especialistas en Meta Ads · Facebook e Instagram',
    'Planificamos, lanzamos y optimizamos tus campañas en Facebook e Instagram, y las medimos con lo que importa: lo que vendes.',
    'Cualquier campaña puede tener un buen mes.',
    'Lo nuestro es sostener las ventas un año completo, sin apagar las campañas.',
    'Tu equipo de publicidad en Meta, sin armarlo dentro de tu empresa.',
    'Eliges lo que necesitas o armamos el sistema completo.',
    'Planificadas, lanzadas y optimizadas cada semana.',
    'Qué vender, a quién y cuánto pagar por cada cliente.',
    'Para que Meta optimice hacia ventas, no hacia clics.',
    'Ganchos y escenas pensados para vender en Meta.',
    'Tu marca explicada en movimiento.',
    'Páginas que convierten el clic en contacto.',
    'Tus números, tu mercado y tu margen.',
    'Objetivo, mensajes y campañas.',
    'Guiones, piezas y campañas al aire.',
    'Cada semana, escalar lo que vende.',
    'Garantizamos lo que firmamos: cantidad, calidad y plazos.',
    'Comunidad gratuita',
    'Resolvemos dudas sobre anuncios en Meta, entre todos.',
    'En nuestro grupo de WhatsApp compartimos lo que aprendemos manejando cuentas reales y respondemos las dudas que van surgiendo. Sin costo.',
    'Grupo «Traffickers del mundo» en WhatsApp',
    'El anuncio empieza en el guion.',
    'Vistas orgánicas en TikTok de marcas con las que trabajamos.',
    'Hablas directo con quien maneja tu cuenta.',
    'Somos dos especialistas y un agente de inteligencia artificial propio que automatiza el trabajo repetitivo. Así escalamos cada cuenta con más precisión.',
    'Cinco preguntas, menos de un minuto. Te escribimos por WhatsApp con la propuesta.',
    'Ventas desde la web, mes a mes. Ningún mes por debajo de 8,7x.',
    'Más de un millón de dólares en ventas para una tienda online de Chile.',
    'Treinta y cuatro mil conversaciones por WhatsApp, a quince centavos de dólar cada una.',
    'Agencia de Meta Ads · Facebook e Instagram.',
  ]) assert.ok(visible.replace(/\s+/g, ' ').includes(t), t);
  assert.match(html, /<meta name="description" content="Especialistas en publicidad en Facebook e Instagram \(Meta Ads\) en Bolivia\. \+US\$1 millón en ventas en 13 meses para una tienda online\. Pide tu cotización\.">/);
  assert.doesNotMatch(visible, /Agencia de marketing digital estratégico|Tu departamento de marketing|Videos que la gente eligió ver|Dos cuentas que manejamos hoy|Un especialista para cada parte|Lo que encontramos|Lo que hicimos|Dónde está hoy|El objetivo|Ustedes graban/);
  assert.equal((html.match(/<details>/g) || []).length, 4, 'quedan cuatro preguntas');
});

test('el equipo son dos personas y el agente', () => {
  assert.doesNotMatch(visible, /Somos cinco|equipo de 5|5 personas|cinco personas/i);
  const equipo = html.match(/<section class="equipo"[\s\S]*?<\/section>/)[0];
  const nombres = [...equipo.matchAll(/<figcaption><b>([^<]+)<\/b><span>([^<]+)<\/span>/g)].map((m) => `${m[1]} — ${m[2]}`);
  assert.deepEqual(nombres, ['Emanuel Baldiviezo — Ingeniero comercial', 'Valeria — Técnica superior en marketing digital', 'Agente DÚO — Inteligencia artificial propia']);
  assert.equal((equipo.match(/<img /g) || []).length, 2, 'el agente no lleva foto de persona');
  assert.match(equipo, /<svg class="agente-u"/);
});

test('en ningún lado se dice que el video se hizo con IA', () => {
  // Ni texto visible, ni alt, ni aria-label, ni texto oculto: el HTML entero.
  assert.doesNotMatch(html, /hecho con IA|hechos con IA|con inteligencia artificial|voz clonada|video animado con IA|videos? animados? con IA|Animación con IA/i);
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(hero, /\bIA\b|inteligencia artificial/i);
  // La IA solo aparece donde es el agente del equipo.
  const fuera = html.replace(/<section class="equipo"[\s\S]*?<\/section>/, '');
  assert.doesNotMatch(fuera.replace(/<script[\s\S]*?<\/script>/g, ''), /inteligencia artificial|\bIA\b/);
});

test('gráfico de ventas: datos verificados, accesible y sin pasos', async () => {
  const { VENTAS_MENSUALES_FEMMENINAS: v } = await import('../datos/datos.mjs');
  assert.equal(v.length, 13);
  const inv = v.reduce((s, m) => s + m.inversion, 0);
  const ventas = v.reduce((s, m) => s + m.ventas, 0);
  assert.ok(Math.abs(inv - 96.3) < 0.05, `inversión ${inv}`);
  assert.ok(Math.abs(ventas - 1005.7) < 0.5, `ventas ${ventas}`);
  assert.ok(Math.abs(ventas / inv - 10.44) < 0.02);
  const retornos = v.map((m) => m.ventas / m.inversion);
  assert.ok(Math.min(...retornos) >= 8.7 && Math.max(...retornos) < 12.75);
  const fig = html.match(/<figure class="grafico"[\s\S]*?<\/figure>/)[0];
  assert.equal((fig.match(/class="g-barra"/g) || []).length, 13);
  assert.match(fig, /<svg [^>]*role="img" aria-label="Ventas mensuales[^"]+"/);
  assert.match(fig, /<div class="sr-only"><table>[\s\S]*<tbody>(<tr>[\s\S]*?<\/tr>){13}<\/tbody>/);
  assert.match(fig, /data-tip="oct 2026 · 107 M CLP en ventas · 9,8x"/);
  assert.match(fig, /data-contador-final="\+US\$1 millón"/);
  assert.doesNotMatch(html, /class="caso-pasos"/);
  const progaming = html.match(/<article class="caso"[^>]*id="caso-progaming"[\s\S]*?<\/article>/)[0];
  assert.doesNotMatch(progaming, /<dl|grafico/);
});

test('cómo trabajamos: recorrido de cuatro nodos con ícono de línea', () => {
  const ol = html.match(/<ol class="recorrido"[\s\S]*?<\/ol>/)[0];
  const titulos = [...ol.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.deepEqual(titulos, ['Diagnóstico', 'Planificación', 'Lanzamiento', 'Optimización']);
  assert.equal((ol.match(/<svg /g) || []).length, 4);
  assert.match(ol, /pathLength="1"/);
});

test('el title y los metadatos dicen Meta Ads', () => {
  assert.match(html, /<title>DÚO — Agencia de Meta Ads en Bolivia<\/title>/);
  assert.match(html, /<meta property="og:title" content="DÚO — Agencia de Meta Ads en Bolivia">/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.match(ld.description, /Meta Ads/);
  assert.ok(ld.knowsAbout.includes('Meta Ads'));
});

test('orden de secciones y menú: Meta Ads primero, el contenido después', () => {
  const ids = [...html.matchAll(/<(?:section|div) class="[^"]*" (?:id|aria-label)="([^"]+)"/g)].map((m) => m[1])
    .filter((id) => ['inicio', 'Marcas con las que trabajamos', 'resultados', 'servicios', 'como', 'comunidad', 'videos', 'equipo', 'cotizar', 'preguntas'].includes(id));
  assert.deepEqual(ids, ['inicio', 'Marcas con las que trabajamos', 'resultados', 'servicios', 'como', 'comunidad', 'videos', 'equipo', 'cotizar', 'preguntas']);
  const menu = html.match(/<nav class="barra-nav"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...menu.matchAll(/>([^<]+)<\/a>/g)].map((m) => m[1]), ['Resultados', 'Servicios', 'Cómo trabajamos', 'Comunidad']);
  const servicios = [...html.matchAll(/<li class="serv">[\s\S]*?<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.deepEqual(servicios, ['Campañas en Facebook e Instagram', 'Estrategia y plan', 'Medición y píxel', 'Guiones para tus anuncios', 'Videos animados', 'Landing para tus anuncios']);
});

test('la comunidad abre el grupo en pestaña nueva, también desde el pie', () => {
  const grupo = 'https://chat.whatsapp.com/J9AZ2CWy0FE3xkOhp43wpx';
  const seccion = html.match(/<section class="comunidad" id="comunidad">[\s\S]*?<\/section>/)[0];
  const boton = seccion.match(/<a [^>]*id="unirme-comunidad"[^>]*>/)[0];
  assert.ok(boton.includes(`href="${grupo}"`));
  assert.ok(boton.includes('target="_blank"'));
  assert.match(boton, /rel="noopener"/);
  assert.match(seccion, /Unirme al grupo<\/a>/);
  const pie = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.match(pie, new RegExp(`<a href="${grupo.replace(/[.]/g, '\\.')}" class="comunidad-enlace" target="_blank" rel="noopener">Comunidad en WhatsApp</a>`));
});

test('unirse a la comunidad avisa al píxel con un evento propio', async () => {
  const app = await readFile(join(PUBLICO, 'js', 'app.js'), 'utf8');
  assert.match(app, /senal\('UnirseComunidad', \{\}, true\)/);
});

test('el muro sigue mostrando los TikTok de clientes', () => {
  const muro = html.match(/<section class="videos"[\s\S]*?<\/section>/)[0];
  assert.match(muro, /\/reels\/01-abbanissi\.mp4/);
  assert.match(muro, /668 mil/);
});

test('canonical, og:url, robots y sitemap apuntan al dominio sin www', async () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/duomarketingdigital\.com\/">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/duomarketingdigital\.com\/">/);
  const robots = await readFile(join(PUBLICO, 'robots.txt'), 'utf8');
  assert.match(robots, /Sitemap: https:\/\/duomarketingdigital\.com\/sitemap\.xml/);
  const sitemap = await readFile(join(PUBLICO, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length >= 2);
  for (const l of locs) assert.match(l, /^https:\/\/duomarketingdigital\.com\//);
  assert.doesNotMatch(html + robots + sitemap, /www\.duomarketingdigital|pages\.dev/);
  assert.doesNotMatch(robots, /Disallow: \//);
});

test('hay 404 propio y página de privacidad', async () => {
  await access(join(PUBLICO, '404.html'));
  await access(join(PUBLICO, 'privacidad', 'index.html'));
});

test('el navegador no dispara Lead: lo manda solo el servidor', async () => {
  const app = await readFile(join(PUBLICO, 'js', 'app.js'), 'utf8');
  assert.doesNotMatch(app, /senal\(\s*['"]Lead/);
  assert.doesNotMatch(app, /fbq\([^)]*['"]Lead/);
  assert.doesNotMatch(app, /window\.open\(/);
});
