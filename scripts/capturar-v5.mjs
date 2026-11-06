/* Pliegue a 1440 y 390, la sección Comunidad a 390, y las pantallas a 390.
 *   node scripts/capturar-v5.mjs [url] [prefijo] */
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json')('playwright');

const url = process.argv[2] || 'http://localhost:8788/';
const prefijo = process.argv[3] || 'v5';
const b = await chromium.launch();
const out = {};
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errores = [];
  p.on('pageerror', (e) => errores.push(String(e)));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `capturas/${prefijo}-${w}-pliegue.png` });
  out[w] = await p.evaluate(() => {
    const c = document.getElementById('comunidad').getBoundingClientRect();
    const k = document.querySelector('.hero-kicker').getBoundingClientRect();
    return { pantallas: +(document.documentElement.scrollHeight / innerHeight).toFixed(1), comunidadPantallas: +(c.height / innerHeight).toFixed(2), kickerLineas: Math.round(k.height / parseFloat(getComputedStyle(document.querySelector('.hero-kicker')).lineHeight || 18)), desborde: document.documentElement.scrollWidth > innerWidth };
  });
  out[w].errores = errores;
  if (w === 390) {
    await p.addStyleTag({ content: '.barra, .barra-movil, .wa-flotante { display: none !important; }' });
    const s = await p.$('#comunidad');
    await s.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await s.screenshot({ path: `capturas/${prefijo}-390-comunidad.png` });
  }
  await p.close();
}
await b.close();
console.log(JSON.stringify(out));
