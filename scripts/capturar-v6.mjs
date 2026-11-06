/* Resultados, Cómo trabajamos y Equipo en su estado final (después de las
 * animaciones), a 1440 y 390. node scripts/capturar-v6.mjs [url] [prefijo] */
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json')('playwright');

const url = process.argv[2] || 'http://localhost:8788/';
const prefijo = process.argv[3] || 'v6';
const TOMAS = { 1440: ['resultados', 'como', 'equipo'], 390: ['resultados', 'como', 'equipo'] };
const b = await chromium.launch();
const informe = {};
for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 390 ? 844 : 900 } });
  const errores = [];
  p.on('pageerror', (e) => errores.push(String(e)));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  for (const id of TOMAS[w]) {
    // Llevar la sección arriba de todo: la línea del recorrido queda completa
    // y el gráfico entra en vista; después esperar a que terminen.
    await p.evaluate((i) => { const s = document.getElementById(i); scrollTo(0, s.getBoundingClientRect().top + scrollY - 10); }, id);
    await p.waitForTimeout(id === 'resultados' ? 600 : 300);
    if (id === 'resultados') await p.evaluate(() => document.querySelector('[data-grafico]').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(2600);
    if (id === 'como') {
      informe[`${w}-como`] = await p.evaluate(() => ({ llegados: document.querySelectorAll('.nodo.llegado').length, linea: document.querySelector('.recorrido-linea i').style.transform }));
    }
    if (id === 'resultados') {
      informe[`${w}-grafico`] = await p.evaluate(() => ({ contador: document.querySelector('[data-contador-final]').textContent, visible: document.querySelector('[data-grafico]').classList.contains('visible') }));
    }
    await p.addStyleTag({ content: '.barra, .barra-movil, .wa-flotante { display: none !important; }' });
    // Si la sección entra en la pantalla, se captura sin mover el scroll: la
    // captura de elemento la reacomoda y el recorrido retrocede.
    const caja = await p.evaluate((i) => { const r = document.getElementById(i).getBoundingClientRect(); return { y: r.top, h: r.height, vh: innerHeight }; }, id);
    if (id !== 'resultados' && caja.h <= caja.vh - caja.y) {
      await p.screenshot({ path: `capturas/${prefijo}-${w}-${id}.png`, clip: { x: 0, y: caja.y, width: w, height: caja.h } });
    } else {
      await p.locator(`#${id}`).screenshot({ path: `capturas/${prefijo}-${w}-${id}.png`, animations: 'allow' });
    }
    await p.addStyleTag({ content: '.barra { display: block !important; } .barra-movil { display: flex !important; }' });
  }
  informe[`${w}-pantallas`] = await p.evaluate(() => +(document.documentElement.scrollHeight / innerHeight).toFixed(1));
  informe[`${w}-errores`] = errores;
  await p.close();
}
await b.close();
console.log(JSON.stringify(informe));
