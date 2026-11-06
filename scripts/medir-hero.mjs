/* Comprueba que las cifras del hero no tapen la pantalla del teléfono.
 *   node scripts/medir-hero.mjs [url] [prefijo]
 * Para cada ancho: cuánto se monta cada tarjeta sobre el teléfono (máx. 20 %
 * de su ancho), que ninguna toque el centro de la pantalla, que no pisen el
 * texto del hero, que cada etiqueta ocupe ≤ 2 líneas y dónde queda el botón
 * de sonido. Guarda el pliegue en capturas/<prefijo>-<ancho>-pliegue.png. */
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json')('playwright');

const url = process.argv[2] || 'http://localhost:8788/';
const prefijo = process.argv[3] || 'v4';
const ANCHOS = [[1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
const b = await chromium.launch();
let fallas = 0;
for (const [w, h] of ANCHOS) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(2200);
  const r = await p.evaluate(() => {
    const caja = (el) => el.getBoundingClientRect();
    const tel = caja(document.querySelector('.telefono-pantalla'));
    // Centro de la pantalla: el 60 % del medio a lo ancho, del 20 % al 80 % a lo alto.
    const centro = { left: tel.left + tel.width * 0.2, right: tel.right - tel.width * 0.2, top: tel.top + tel.height * 0.2, bottom: tel.bottom - tel.height * 0.2 };
    const cruza = (a, c) => a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top;
    const textos = [...document.querySelectorAll('.hero-txt > *')].map(caja);
    const tarjetas = [...document.querySelectorAll('.dato')].map((d) => {
      const c = caja(d);
      const etq = d.querySelector('.dato-etq');
      const lineas = Math.round(etq.getBoundingClientRect().height / parseFloat(getComputedStyle(etq).lineHeight));
      const montaIzq = c.left < tel.left ? Math.max(0, c.right - tel.left) : 0;
      const montaDer = c.right > tel.right ? Math.max(0, tel.right - c.left) : 0;
      const monta = Math.max(montaIzq, montaDer, c.left >= tel.left && c.right <= tel.right ? c.width : 0);
      return { valor: d.querySelector('.dato-valor').textContent, montaPct: Math.round((monta / tel.width) * 100), tocaCentro: cruza(c, centro), pisaTexto: textos.some((t) => cruza(c, t)), lineas, fuera: c.left < 0 || c.right > innerWidth };
    });
    const son = caja(document.getElementById('boton-sonido'));
    return { tarjetas, sonidoAbajo: Math.round(son.bottom), alto: innerHeight, telAncho: Math.round(tel.width), desborde: document.documentElement.scrollWidth > innerWidth };
  });
  const malas = r.tarjetas.filter((t) => t.montaPct > 20 || t.tocaCentro || t.pisaTexto || t.lineas > 2 || t.fuera);
  const sonidoOk = w !== 1440 || r.sonidoAbajo <= r.alto;
  if (malas.length || !sonidoOk || r.desborde) fallas++;
  console.log(`${w}px  teléfono ${r.telAncho}px · sonido abajo en ${r.sonidoAbajo}/${r.alto}${sonidoOk ? '' : ' ✖ bajo el pliegue'}${r.desborde ? ' · ✖ desborde' : ''}`);
  for (const t of r.tarjetas) console.log(`   ${t.valor.padEnd(14)} se monta ${String(t.montaPct).padStart(2)} %  · centro ${t.tocaCentro ? '✖' : 'libre'} · texto ${t.pisaTexto ? '✖' : 'libre'} · ${t.lineas} líneas${t.fuera ? ' · ✖ fuera' : ''}`);
  await p.screenshot({ path: `capturas/${prefijo}-${w}-pliegue.png` });
  await p.close();
}
await b.close();
console.log(fallas ? `✖ ${fallas} ancho(s) con problemas` : '✔ todo en orden');
process.exitCode = fallas ? 1 : 0;
