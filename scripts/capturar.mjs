/* Capturas de página completa a 390, 768, 1440 y 1920 px.
 *
 *   node scripts/capturar.mjs [url] [prefijo]
 *
 * Por defecto mira el servidor local (http://localhost:8788). Guarda en
 * capturas/ y mide: alto en pantallas a 390 px, peso de la portada sin videos
 * y palabras visibles. Playwright se toma de la instalación global o de la
 * landing de Hellohome, que ya lo tiene con Chromium. */

import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const URL_BASE = process.argv[2] || 'http://localhost:8788/';
const PREFIJO = process.argv[3] || 'local';
const ANCHOS = [[390, 844], [768, 1024], [1440, 900], [1920, 1080]];

function cargarPlaywright() {
  const lugares = [RAIZ, 'C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/'];
  for (const l of lugares) {
    try { return createRequire(join(l, 'package.json'))('playwright'); } catch { /* sigue */ }
  }
  throw new Error('No encuentro playwright');
}

const { chromium } = cargarPlaywright();
const navegador = await chromium.launch();
await mkdir(join(RAIZ, 'capturas'), { recursive: true });
const informe = {};

for (const [ancho, alto] of ANCHOS) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  let bytes = 0;
  let bytesVideo = 0;
  pagina.on('response', async (r) => {
    try {
      const largo = Number(r.headers()['content-length'] || (await r.body()).length || 0);
      if ((r.headers()['content-type'] || '').includes('video')) bytesVideo += largo; else bytes += largo;
    } catch { /* respuestas sin cuerpo */ }
  });
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(String(e)));
  pagina.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await pagina.goto(URL_BASE, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(1500);
  // Recorre la página para que carguen las imágenes diferidas.
  const total = await pagina.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += alto * 0.8) { await pagina.evaluate((yy) => scrollTo(0, yy), y); await pagina.waitForTimeout(140); }
  await pagina.evaluate(() => scrollTo(0, 0));
  await pagina.waitForTimeout(900);
  const medidas = await pagina.evaluate(() => {
    const visibles = [...document.querySelectorAll('main *')].filter((el) => el.children.length === 0 && el.offsetParent !== null && !el.closest('[aria-hidden="true"], form, .gracias, details:not([open]) p'));
    const palabras = visibles.map((el) => el.textContent.trim()).join(' ').split(/\s+/).filter(Boolean).length;
    const desborde = document.documentElement.scrollWidth > innerWidth;
    const cta = document.querySelector('.hero-acciones .boton')?.getBoundingClientRect();
    return { alto: document.documentElement.scrollHeight, pantallas: +(document.documentElement.scrollHeight / innerHeight).toFixed(1), palabras, desborde, ctaBajo: cta ? Math.round(cta.bottom) : null };
  });
  await pagina.screenshot({ path: join(RAIZ, 'capturas', `${PREFIJO}-${ancho}-pliegue.png`) });
  await pagina.screenshot({ path: join(RAIZ, 'capturas', `${PREFIJO}-${ancho}-completa.png`), fullPage: true });
  informe[ancho] = { ...medidas, kbSinVideo: Math.round(bytes / 1024), kbVideo: Math.round(bytesVideo / 1024), errores };
  await pagina.close();
}
await navegador.close();
await writeFile(join(RAIZ, 'capturas', `${PREFIJO}-medidas.json`), JSON.stringify(informe, null, 2));
console.log(JSON.stringify(informe, null, 2));
